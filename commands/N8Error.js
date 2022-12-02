const { SlashCommandBuilder } = require("@discordjs/builders");

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

module.exports = {
	data: new SlashCommandBuilder()
    .setName("hek")
    .setDescription("Throw A fake error and see what happens"),
	async execute(interaction) {
		console.log("were in the zone");

		//throw "Some error string"

		interaction.reply({
			content:
				"Hek u 2",
			ephemeral: true,
		});
	}
}