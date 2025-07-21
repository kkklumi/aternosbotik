const { Client, GatewayIntentBits, Partials } = require("discord.js");
const startAternos = require("./startAternos");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

client.on("ready", () => {
  console.log(`✅ Бот запущен как ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!старт") {
    await message.reply("⏳ Пытаюсь запустить сервер Aternos...");
    try {
      const result = await startAternos();
      await message.reply(result);
    } catch (error) {
      await message.reply(`❌ Ошибка:\n\`\`\`${error.message}\`\`\``);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
