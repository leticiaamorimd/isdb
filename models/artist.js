const mongoose = require("mongoose");

const schema = mongoose.Schema({
  ArtistId: String,
  Name: String
});

module.exports = mongoose.model("Artist", schema);