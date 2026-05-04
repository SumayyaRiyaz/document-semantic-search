const { pipeline } = require("@xenova/transformers");

let extractor;

const getEmbedding = async (text) => {
  try {
    if (!extractor) {
      console.log("⏳ Loading local model...");
      extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
      console.log("✅ Model loaded");
    }

    const output = await extractor(text, {
      pooling: "mean",
      normalize: true,
    });

    return Array.from(output.data);

  } catch (err) {
    console.error("Embedding error:", err.message);
  }
};

module.exports = getEmbedding;