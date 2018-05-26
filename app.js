var express = require('express');

var app = express();
app.set('view engine', 'ejs');

app.get("/", function(req,res){
    res.render("home");
});

var port = process.env.PORT || 5000;

app.listen(port, function(){
    console.log("Running on port " + port);
});