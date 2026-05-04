console.log("✅ Document route loaded");

const express = require("express");
const router = express.Router();
const Document = require("../models/Document");
const getEmbedding = require("../utils/embedding"); // ❌ temporarily disabled
const cosineSimilarity = (a, b) => {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return magA && magB ? dot / (magA * magB) : 0;
};
router.get("/test", (req, res) => {
  res.send("Test route working ✅");
});
router.post("/add", async (req, res) => {
  try {
    const { text } = req.body;

    // ❌ disable embedding for now
    // const embedding = await getEmbedding(text);

    const embedding = await getEmbedding(text);

const doc = new Document({
  text,
  embedding
});

    const savedDoc = await doc.save();
console.log("Saved in DB:", savedDoc);

    res.json({ message: "Document saved ✅" });
  } catch (err) {
    console.log(err); // helps debug
    res.status(500).json({ error: err.message });
  }
});
router.post("/search", async (req, res) => {
  try {
    const { query } = req.body;

    console.log("Search query:", query);

    // 1️⃣ Convert query to embedding
    const queryEmbedding = await getEmbedding(query);

    // 2️⃣ Get all docs
    const uniqueTexts = await Document.distinct("text");

const docs = await Promise.all(
  uniqueTexts.map(text => Document.findOne({ text }))
);

    // 3️⃣ Compare similarity
    const results = docs
  .filter(doc => doc.embedding && doc.embedding.length > 0)
  .map(doc => ({
    text: doc.text,
    fileName: doc.fileName,   
    section: doc.section,
    score: cosineSimilarity(queryEmbedding, doc.embedding)
  }));

    // 4️⃣ Sort
results.sort((a, b) => b.score - a.score);

// 5️⃣ Limit
const topResults = results.slice(0, 5);

res.json({
  message: "Semantic search working 🚀",
  results: topResults
});

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;