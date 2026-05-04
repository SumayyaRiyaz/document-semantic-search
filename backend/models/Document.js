const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  text: String,
  embedding: [Number],
  section: String,
  fileName: String,
  pageNumber: Number   // 🔥 ADD THIS
});

module.exports = mongoose.model("Document", documentSchema);