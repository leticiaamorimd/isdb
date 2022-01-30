const mongoose = require("mongoose");

const schema = mongoose.Schema({
  TrackId: String,
  Name: String,
  AlbumId: String,
  MediaTypeId: String,
  GenereId: String,
  Composer: String,
  MilliSeconds: String,
  Bytes: String,
  UniPrice: String,
});

module.exports = mongoose.model("Track", schema);
