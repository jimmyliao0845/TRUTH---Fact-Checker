const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Multer for DOCX/file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Fetch Copyleaks Access Token
async function getCopyleaksToken() {
  const resp = await fetch("https://id.copyleaks.com/v3/account/login/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.COPYLEAKS_EMAIL,
      key: process.env.COPYLEAKS_KEY
    }),
  });

  if (!resp.ok) throw new Error("Failed to get access token");
  const data = await resp.json();
  return data.access_token;
}

// ✅ AI Text Detection Endpoint
app.post("/api/ai-detect/text", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Missing text" });

  try {
    const token = await getCopyleaksToken();
    const scanId = `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const response = await fetch(
      `https://api.copyleaks.com/v2/writer-detector/${scanId}/check`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }
    );

    const result = await response.json();
    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI detection failed" });
  }
});

// ✅ AI Detection for DOCX Upload
app.post("/api/ai-detect/docx", upload.single("file"), async (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: "Missing file" });

  try {
    const token = await getCopyleaksToken();
    const scanId = `docx-${Date.now()}`;

    const response = await fetch(
      `https://api.copyleaks.com/v2/writer-detector/${scanId}/check-file`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: req.file.buffer,
      }
    );

    const result = await response.json();
    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DOCX detection failed" });
  }
});

// ✅ Mock Image/Video Detection (Future Upgrade: OCR / Speech-to-Text)
app.post("/api/detect/image", upload.single("file"), (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: "No file uploaded" });

  const mockResult = {
    status: "success",
    fileName: req.file.originalname,
    aiScore: Math.floor(Math.random() * 100),
    humanScore: Math.floor(Math.random() * 100),
  };

  res.json(mockResult);
});

// ✅ Server Test
app.get("/", (req, res) => res.send("Server is Running ✅"));

app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
