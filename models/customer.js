var mongoose = require('mongoose');
var passportLocalMongoose = require("passport-local-mongoose");
var orderSchema = require('./order')[1];

var userSchema = mongoose.Schema({
    username: String,
    password : String,
    email: String,
    name: String,
    phoneNumber : String,
    orders: [orderSchema]
});

userSchema.plugin(passportLocalMongoose);


var User = mongoose.model("Customer", userSchema);


module.exports = User;