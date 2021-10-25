const Discord = require("discord.js");
const { prefix, token } = require("./config.json");
const ytdl = require("ytdl-core");

const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});

client.once("ready", () => {
  console.log("Ready!");
});
client.once("reconnecting", () => {
  console.log("Reconnecting!");
});
client.once("disconnect", () => {
  console.log("Disconnect!");
});
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "yo") {
    await interaction.reply("Yo.");
  } else if (commandName === "server") {
    await interaction.reply(
      `Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`
    );
  } else if (commandName === "user") {
    await interaction.reply("User info.");
  }
});
client.login(token);
