const fs = require("fs");
const { exec, execSync } = require("child_process");
const { token, serverChannel } = require("./generalConfig.json");

const {
  Client,
  Events,
  Collection,
  GatewayIntentBits,
  Partials,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.login(token);
