// Men-deploy/register slash commands ke satu guild (lebih cepat untuk pengujian).
// Pastikan mengisi .env atau variabel lingkungan: BOT_TOKEN, CLIENT_ID, GUILD_ID
require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [
  {
    name: 'gen',
    description: 'Unduh manifest ZIP untuk appid',
    options: [
      {
        name: 'appid',
        type: 3, // STRING
        description: 'ID aplikasi (appid)',
        required: true
      }
    ]
  },
  {
    name: 'lua',
    description: 'Unduh file Lua untuk appid',
    options: [
      {
        name: 'appid',
        type: 3, // STRING
        description: 'ID aplikasi (appid)',
        required: true
      }
    ]
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log('LOGIN XYNTRA | Please wait. . .');
    if (!process.env.CLIENT_ID || !process.env.GUILD_ID) {
      throw new Error('Set environment variables CLIENT_ID and GUILD_ID untuk deploy commands ke guild.');
    }
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('Commands terdaftar di guild.');
  } catch (err) {
    console.error('Error saat mendaftarkan commands:', err);
  }
})();