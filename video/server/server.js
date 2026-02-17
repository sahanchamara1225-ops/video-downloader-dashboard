const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;
const SECRET = "supersecretkey";

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/downloads", express.static("downloads"));

if (!fs.existsSync("downloads")) {
  fs.mkdirSync("downloads");
}

// Simple user database (demo)
const users = [
  {
    username: "admin",
    password: bcrypt.hashSync("1234", 10)
  }
];

// Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ username }, SECRET, { expiresIn: "2h" });
  res.json({ token });
});

// Middleware verify
function authenticate(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(403).json({ error: "Access denied" });

  try {
    jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Download route (protected)
app.post("/download", authenticate, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL required" });

    const filePath = path.join(__dirname, "downloads", "nokiyapu-adare.mp4");

    const response = await axios({
      method: "GET",
      url: url,
      responseType: "stream"
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      res.json({ success: true, file: "/downloads/nokiyapu-adare.mp4" });
    });

  } catch {
    res.status(500).json({ error: "Download failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
