const mongoose = require("mongoose");

const schema = mongoose.Schema({
  ArtistId: String,
  AlbumId:String,
  Title: String
});

module.exports = mongoose.model("Album", schema);