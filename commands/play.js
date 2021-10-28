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
      const connection = joinVoiceChannel({
        channelId: interaction.member.voice.channelId,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      const stream = ytdl(search, { filter: "audioonly" });
      const resource = createAudioResource(stream, {
        inputType: StreamType.Arbitrary,
      });
      songQueue.push(resource);
      if (songQueue.length == 1) {
        interaction.reply({ content: `Playing ${search}` });

        connection.subscribe(player);
        player.play(songQueue[0]);
      } else if (songQueue.length > 1) {
        interaction.reply({
          content: `Adding ${search} to queue! It is currently in spot ${songQueue.length}`,
        });
      }

      player.on("error", (error) => {
        console.error(`Error: ${error.message} Full Error: ${error}`);
      });

      connection.on("stateChange", (oldState, newState) => {
        console.log(
          `Connection transitioned from ${oldState.status} to ${newState.status}`
        );
      });

      player.on("stateChange", (oldState, newState) => {
        console.log(
          `Audio player transitioned from ${oldState.status} to ${newState.status}`
        );
        if (oldState.status == "playing" && newState.status == "idle") {
          songQueue.shift();
          if (songQueue.length > 0) {
            player.play(songQueue[0]);
          }
        }
      });
      player.on(AudioPlayerStatus.Idle, () => {});
    } else {
      interaction.reply({
        content: `Please join a voice channel!`,
        ephemeral: true,
      });
    }
  },
};
