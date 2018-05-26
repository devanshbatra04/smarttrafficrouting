var express = require('express');

var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/Evenox");

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