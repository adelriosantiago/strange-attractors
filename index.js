const http = require("http");
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const port = 8844;
const saveDir = path.join(__dirname, "savefiles");

const toSafeChunk = (value) => {
  return String(value)
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .slice(0, 60);
};

const timestampForFilename = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
};

app.use(express.json());

app.use(express.static("public"));
app.get("/", () => {
  // Serve public/index.html by default
});

app.post("/save-attractor", (req, res) => {
  try {
    const { attractorName, a, b, c } = req.body || {};

    if (!attractorName || a === undefined || b === undefined || c === undefined) {
      return res.status(400).json({ error: "Missing attractor name or slider parameters." });
    }

    fs.mkdirSync(saveDir, { recursive: true });

    const fileName = `${timestampForFilename()}__${toSafeChunk(
      attractorName
    )}__a-${toSafeChunk(a)}_b-${toSafeChunk(b)}_c-${toSafeChunk(c)}.json`;

    const filePath = path.join(saveDir, fileName);
    const payload = {
      savedAt: new Date().toISOString(),
      attractorName,
      sliders: { a, b, c },
    };

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");

    return res.status(201).json({ message: "Saved", fileName });
  } catch (error) {
    return res.status(500).json({ error: "Failed to save attractor." });
  }
});

server.listen(port);

console.log(`IDE running on http://localhost: ${port}.`);
