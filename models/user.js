const mongoose = require("mongoose");

const schema = mongoose.Schema({
  userName: String,
  password: String,
  token:String
});

module.exports = mongoose.model("User", schema);