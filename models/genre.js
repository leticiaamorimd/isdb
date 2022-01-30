const mongoose = require("mongoose");

const schema = mongoose.Schema({
  GenreId: String,
  Name: String
});

module.exports = mongoose.model("Genre", schema);