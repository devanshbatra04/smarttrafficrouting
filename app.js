const express                = require('express'),
    mongoose                 = require("mongoose"),
    passport                 = require('passport'),
    bodyParser               = require('body-parser'),
    localStrategy            = require('passport-local'),
    passportLocalMongoose    = require('passport-local-mongoose');

var User = require('./models/user');

mongoose.connect("mongodb://localhost/Evenox");

app.use(require("express-session")({
    secret: "Please work this time",
    resave : false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


var app = express();
app.set('view engine', 'ejs');

app.get("/", function(req,res){
    res.render("home");
});

app.get("/secret", function(req,res){
    res.render("secret");
});

var port = process.env.PORT || 5000;


app.listen(port, function(){
    console.log("Running on port " + port);
});