const { SlashCommandBuilder } = require("@discordjs/builders");
const ytdl = require("ytdl-core");
const {
  AudioPlayerStatus,
  StreamType,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  entersState,
} = require("@discordjs/voice");
const { apiKey } = require("../config.json");
const https = require("https");

let songQueue = [];
const player = createAudioPlayer();
let connectionBool = false;
console.log("Hit init");
const linkRegex = new RegExp("(https?:\\/\\/)?youtu(.be)?(be.com)?\\/");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song in your voice channel")
    .addStringOption((option) =>
      option.setName("search").setDescription("The song you want to play")
    ),
  async execute(interaction) {
    const search = interaction.options.getString("search");
    if (search == null) {
      interaction.reply({
        content:
          "Please provide a link and be sure Discord recognizes it as an arguement.",
        ephemeral: true,
      });
      return;
    }
    if (interaction.member.voice.channelId) {
      //Check if bot is already connected
      if (!connectionBool) {
        const connection = joinVoiceChannel({
          channelId: interaction.member.voice.channelId,
          guildId: interaction.guildId,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });
        console.log("Initializing Connection");
        connection.subscribe(player);
        connectionBool = true;

        //Keep track of state changes
        connection.on("stateChange", (oldState, newState) => {
          console.log(
            `Connection transitioned from ${oldState.status} to ${newState.status}`
          );
        });
        player.on("error", (error) => {
          console.error(`Error: ${error.message} Full Error: ${error}`);
        });

        player.on("stateChange", (oldState, newState) => {
          console.log(
            `Audio player transitioned from ${oldState.status} to ${newState.status}`
          );
        });

        //When bot finishes song, either play next or disconnect
        player.on(AudioPlayerStatus.Idle, () => {
          songQueue.shift();
          if (songQueue.length > 0) {
            player.play(songQueue[0]);
            console.log("Playing next song!");
          } else {
            connection.destroy();
            connectionBool = false;
            player.removeAllListeners();
          }
        });
      }

      //Check if search is a link
      if (linkRegex.test(search)) {
        const stream = ytdl(search, { filter: "audioonly" });
        const resource = createAudioResource(stream, {
          inputType: StreamType.Arbitrary,
        });
        songQueue.push(resource);
        if (songQueue.length == 1) {
          interaction.reply({ content: `Playing ${search}` });

          player.play(songQueue[0]);
        } else if (songQueue.length > 1) {
          interaction.reply({
            content: `Adding ${search} to queue! It is currently in spot ${songQueue.length}`,
          });
        }
      } else {
        let searchResult;
        let videoId;
        let videoUrl;

        //Search for video using Youtube API
        https
          .get(
            `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&q=${search}&key=${apiKey}`,
            (res) => {
              let data = "";
              res.on("data", (chunk) => {
                data += chunk;
              });
              res.on("end", () => {
                searchResult = JSON.parse(data);
                videoId = searchResult?.items[0].id.videoId;
                videoUrl = `https://youtu.be/${videoId}`;
                const stream = ytdl(videoUrl, { filter: "audioonly" });
                const resource = createAudioResource(stream, {
                  inputType: StreamType.Arbitrary,
                });
                songQueue.push(resource);
                if (songQueue.length == 1) {
                  interaction.reply({ content: `Playing ${videoUrl}` });

                  player.play(songQueue[0]);
                } else if (songQueue.length > 1) {
                  interaction.reply({
                    content: `Adding ${videoUrl} to queue! It is currently in spot ${songQueue.length}`,
                  });
                }
              });
            }
          )
          .on("error", (err) => {
            console.log("Error: " + err.message);
          });
      }
    } else {
      interaction.reply({
        content: `Please join a voice channel!`,
        ephemeral: true,
      });
    }
  },
};
