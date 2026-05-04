const express = require("express");
const router = express.Router();

const Document = require("../models/Document");
const getEmbedding = require("../utils/embedding");

// cosine similarity
const cosineSimilarity = (A, B) => {
  const dot = A.reduce((sum, a, i) => sum + a * B[i], 0);
  const magA = Math.sqrt(A.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(B.reduce((sum, b) => sum + b * b, 0));
  return magA && magB ? dot / (magA * magB) : 0;
};

router.post("/chat", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question required" });
    }

    // 🔹 1. embedding
    const queryEmbedding = await getEmbedding(question);

    // 🔹 2. fetch docs
    const docs = await Document.find();

    // 🔹 3. score + rank
    const ranked = docs
      .filter(doc => doc.embedding && doc.embedding.length > 0)
      .map(doc => ({
        text: doc.text,
        fileName: doc.fileName,
        score: cosineSimilarity(queryEmbedding, doc.embedding)
      }))
      .sort((a, b) => b.score - a.score);

    // 🔹 4. take TOP 2 only
    const topDocs = ranked.slice(0, 1);

    // 🔹 5. remove duplicates
    const uniqueTexts = [...new Set(topDocs.map(d => d.text))];

    // 🔹 6. build context
    const context = uniqueTexts.join(" ");

    // 🔹 7. clean answer
    const cleanAnswer = context
      .replace(/\s+/g, " ")
      .replace(/\.{2,}/g, ".")
      .trim();

    // 🔹 8. final answer
    const answer = `
📌 ${cleanAnswer.slice(0, 180)}...

📄 Source: ${topDocs[0]?.fileName || "Document"}
`;

    res.json({
      answer,
      sources: topDocs
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;