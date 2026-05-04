const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");

const Document = require("../models/Document");
const getEmbedding = require("../utils/embedding");

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    let content = "";

    // ✅ HANDLE PDF
    if (req.file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      content = data.text;
    } else {
      // ✅ HANDLE TEXT FILES
      content = fs.readFileSync(filePath, "utf-8");
    }

    // ✅ CLEAN TEXT
    content = content
      .replace(/\r/g, "")
      .replace(/\n/g, " ");

    // ✅ SPLIT INTO MEANINGFUL SENTENCES
    const rawLines = content
      .split(/(?<=[.?!])\s+/)
      .map(line => line.trim())
      .filter(line => line.length > 50);

    let currentSection = "general";
    const documents = [];

    for (let line of rawLines) {
      const lower = line.toLowerCase();

      // ✅ SECTION DETECTION
      if (lower.includes("skill")) currentSection = "skills";
      else if (lower.includes("education")) currentSection = "education";
      else if (lower.includes("experience")) currentSection = "experience";
      else if (lower.includes("project")) currentSection = "projects";

      const embedding = await getEmbedding(line);

      documents.push({
        text: line,
        embedding,
        section: currentSection,
        fileName: req.file.originalname
      });
    }

    // ✅ SAVE TO DB
    await Document.insertMany(documents);

    // ✅ DELETE TEMP FILE
    fs.unlinkSync(filePath);

    res.json({ message: "File uploaded and processed ✅" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;