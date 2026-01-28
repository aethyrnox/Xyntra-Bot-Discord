require("dotenv").config();
const { Client, GatewayIntentBits, REST, Routes, AttachmentBuilder, EmbedBuilder } = require("discord.js");

// Konfigurasi API dan token
const BOT_TOKEN = process.env.BOT_TOKEN || ""; // Ganti dengan token bot Anda
const CLIENT_ID = ""; // Ganti dengan ID aplikasi bot Anda
const API_KEY = "RYUUMANIFESThv3ga1"; //jangan diubah

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.on("ready", () => {
  console.log(`Bot is online as ${client.user.tag}`);
  client.user.setActivity(
    `${client.guilds.cache.size} Servers | XYNTRA.CC Made by darkd3mand` // Jangan diganti atau crash
  );
});

// Fungsi untuk mendapatkan detail game dari SteamDB API
async function fetchGameDetails(appid) {
  const steamdbApiUrl = `https://store.steampowered.com/api/appdetails?appids=${appid}`;

  try {
    const response = await fetch(steamdbApiUrl);
    const data = await response.json();
    if (!data[appid] || !data[appid].success) {
      throw new Error("Game tidak ditemukan di SteamDB.");
    }
    const gameData = data[appid].data;

    // Ekstrak detail game
    const gameName = gameData.name || "Unknown Game";
    const price =
      gameData.price_overview?.final_formatted || "Harga tidak tersedia";
    const gameImage = gameData.header_image || "";

    return { name: gameName, price, image: gameImage };
  } catch (error) {
    console.error("Error fetching game data:", error.message);
    // Kembalikan data default jika terjadi kesalahan
    return { name: "Unknown Game", price: "Harga tidak tersedia", image: "" };
  }
}

// Handler untuk commands
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;
  const appid = options.getString("appid");

  // Input Validation
  if (!appid || !/^[A-Za-z0-9_.-]+$/.test(appid)) {
    await interaction.reply({
      content:
        "AppID tidak valid. Gunakan hanya huruf, angka, dash (-), underscore (_), atau titik (.)",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply();

  try {
    const gameDetails = await fetchGameDetails(appid);

    if (commandName === "gen") {
      // Manifest Lua ZIP
      const manifestUrl = `https://generator.ryuu.lol/secure_download?appid=${encodeURIComponent(
        appid
      )}&auth_code=${API_KEY}`;
      const response = await fetch(manifestUrl);

      if (!response.ok) {
        throw new Error(`Gagal mengunduh Manifest. Status HTTP: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const attachment = new AttachmentBuilder(buffer, { name: `${appid}.zip` });

      const embed = new EmbedBuilder()
        .setColor(0x00ff00) // Hijau
        .setTitle("Generate Success!")
        .setDescription(`Game Name: **${gameDetails.name}**\nPrice: **${gameDetails.price}**\nAppID: **${appid}**`)
        .setImage(gameDetails.image)
        .setFooter({ text: "XYNTRA.CC © 2026 darkd3mand" });

      await interaction.editReply({
        embeds: [embed],
        files: [attachment],
      });
    } else if (commandName === "lua") {
      // Lua File
      const luaUrl = `https://generator.ryuu.lol/resellerlua/${encodeURIComponent(
        appid
      )}?auth_code=${API_KEY}`;
      const response = await fetch(luaUrl);

      if (!response.ok) {
        throw new Error(`Gagal mengunduh file Lua. Status HTTP: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const attachment = new AttachmentBuilder(buffer, { name: `${appid}.lua` });

      const embed = new EmbedBuilder()
        .setColor(0x00ff00) // Hijau
        .setTitle("Generate Success!")
        .setDescription(`Game Name: **${gameDetails.name}**\nPrice: **${gameDetails.price}**\nAppID: **${appid}**`)
        .setImage(gameDetails.image)
        .setFooter({ text: "XYNTRA.CC © 2026 darkd3mand" });

      await interaction.editReply({
        embeds: [embed],
        files: [attachment],
      });
    }
  } catch (error) {
    console.error(error);
    await interaction.editReply({
      content: `Terjadi kesalahan atau mungkin koneksi HOST lambat saat mencoba mengambil file: ${error.message}`, // Jangan diubah
    });
  }
});

// Deploy commands menggunakan REST
const commands = [
  {
    name: "gen",
    description: "Unduh Manifest ZIP untuk appid tertentu.",
    options: [
      {
        name: "appid",
        description: "ID aplikasi yang ingin diunduh.",
        type: 3, // STRING
        required: true,
      },
    ],
  },
  {
    name: "lua",
    description: "Unduh file Lua untuk appid tertentu.",
    options: [
      {
        name: "appid",
        description: "ID aplikasi yang ingin diunduh.",
        type: 3, // STRING
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

(async () => {
  try {
    console.log("Tunggu Sebentar . . .");
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log("Bot Berfungsi dengan baik | XYNTRA.CC CREATED BY DARKD3MAND"); // Pesan log saat berhasil mendaftarkan commands
  } catch (err) {
    console.error("Gagal mendaftarkan commands", err);
  }
})();

// Bot login
client.login(BOT_TOKEN);