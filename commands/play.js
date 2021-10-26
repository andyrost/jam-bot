const { SlashCommandBuilder } = require("@discordjs/builders");
const ytdl = require("ytdl-core");
const {
  AudioPlayerStatus,
  StreamType,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} = require("@discordjs/voice");

let songQueue = [];
module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song in your voice channel")
    .addStringOption((option) =>
      option.setName("search").setDescription("The song you want to play")
    ),
  async execute(interaction) {
    const search = interaction.options.getString("search");
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
      const player = createAudioPlayer();
      connection.subscribe(player);
      player.play(resource);

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
      });

      interaction.reply({ content: `Playing ${search}` });

      player.on(AudioPlayerStatus.Idle, () => connection.destroy());
    } else {
      interaction.reply({
        content: `Please join a voice channel!`,
        ephemeral: true,
      });
    }
  },
};
