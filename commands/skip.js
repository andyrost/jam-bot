const { SlashCommandBuilder } = require("@discordjs/builders");
var { songQueue } = require("../index");
const { player } = require("../index");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips the current song of the player"),
  async execute(interaction) {
    if (songQueue.length <= 1) {
      player.stop();
      interaction.reply({
        content: "No more songs in queue... ",
      });
    } else {
      songQueue.shift();
      player.play(songQueue[0]);
      interaction.reply({
        content: "Skipping song...",
      });
      return;
    }
  },
};
