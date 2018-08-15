var mongoose = require('mongoose');
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = mongoose.Schema({
    username: String,
    password : String,
    email: String,
    name: String,
    phoneNumber : String,
    MobVerified: Boolean,
    OTP: Number,
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "order"
    }]
});

userSchema.plugin(passportLocalMongoose);


var User = mongoose.model("Customer", userSchema);


module.exports = User;