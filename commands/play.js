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

let songQueue = [];
const player = createAudioPlayer();
let connectionBool = false;
console.log("Hit init");

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
      if (!connectionBool) {
        const connection = joinVoiceChannel({
          channelId: interaction.member.voice.channelId,
          guildId: interaction.guildId,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });
        console.log("Hit connection bool");
        connection.subscribe(player);
        connectionBool = true;
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
      interaction.reply({
        content: `Please join a voice channel!`,
        ephemeral: true,
      });
    }
  },
};
