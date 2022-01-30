const mongoose = require("mongoose");

const schema = mongoose.Schema({
  MediaTypeId: String,
  Name: String
});

module.exports = mongoose.model("Media_Type", schema);