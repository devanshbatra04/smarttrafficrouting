var mongoose = require('mongoose');
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = mongoose.Schema({
    username: String,
    password : String
});

var User = mongoose.model("User", userSchema);

userSchema.plugin(passportLocalMongoose);

module.exports = User;