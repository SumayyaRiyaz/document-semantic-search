const express = require("express");
const router = express.Router();

const Document = require("../models/Document");
const getEmbedding = require("../utils/embedding");

// ✅ cosine similarity
const cosineSimilarity = (A, B) => {
  const dotProduct = A.reduce((sum, a, i) => sum + a * B[i], 0);
  const magnitudeA = Math.sqrt(A.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(B.reduce((sum, b) => sum + b * b, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
};

router.post("/search", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const queryEmbedding = await getEmbedding(query);

    const docs = await Document.find();

    const results = docs
      .filter(doc => doc.embedding && doc.embedding.length > 0)
      .map(doc => {
        const keywordMatch = doc.text
          .toLowerCase()
          .includes(query.toLowerCase()) ? 0.2 : 0;

        const similarity = cosineSimilarity(queryEmbedding, doc.embedding);

        return {
          text: doc.text,
          fileName: doc.fileName || "Unknown",
          pageNumber: doc.pageNumber,
          score: similarity + keywordMatch
        };
      });

    const filtered = results
      .filter(item => {
        const keywordMatch = item.text.toLowerCase().includes(query.toLowerCase());
        return item.score > 0.5 && keywordMatch;
      })
      .sort((a, b) => b.score - a.score);

    if (filtered.length === 0) {
      return res.json({ results: [] });
    }

    res.json({
      results: filtered.slice(0, 5)
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ THIS MUST BE OUTSIDE
module.exports = router;