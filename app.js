const express                = require('express'),
    mongoose                 = require("mongoose"),
    passport                 = require('passport'),
    bodyParser               = require('body-parser'),
    localStrategy            = require('passport-local'),
    passportLocalMongoose    = require('passport-local-mongoose');

var checksum = require('./paytm/web-2/model/checksum');
var config = require('./paytm/web-2/config/config');

var User = require('./models/customer');
var Order = require('./models/order');

mongoose.connect("mongodb://admin:admin123@ds139921.mlab.com:39921/grubxvendor");


var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.use(require("express-session")({
    secret: "Please work this time",
    resave : false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/////////////////////////////////////// ROUTES//////////////////////////////////////////////////////////

app.post('/checksumcreate',function(req, res) {
    console.log("POST Order start");
    var paramlist = req.body;
    var paramarray = new Array();
    // console.log(paramlist);
    for (name in paramlist)
    {
        if (name == 'PAYTM_MERCHANT_KEY') {
            var PAYTM_MERCHANT_KEY = paramlist[name] ;
        }else
        {
            paramarray[name] = paramlist[name] ;
        }
    }
    //console.log(paramarray);
    paramarray['CALLBACK_URL'] = 'http://localhost:5000/response';  // in case if you want to send callback
    console.log(PAYTM_MERCHANT_KEY);
    checksum.genchecksum(paramarray, PAYTM_MERCHANT_KEY, function (err, result)
    {
          console.log(result);
          // res.send(result);
       res.render('pgredirect.ejs',{ 'restdata' : result });
    });
    //
    // console.log("POST Order end");

});

app.post('/checksumcreate-android',function(req, res) {
    var paramlist = req.body;
    var paramarray = new Array();
    // console.log(paramlist);
    for (name in paramlist)
    {
        if (name == 'PAYTM_MERCHANT_KEY') {
            var PAYTM_MERCHANT_KEY = paramlist[name] ;
        }else
        {
            paramarray[name] = paramlist[name] ;
        }
    }

    checksum.genchecksum(paramarray, PAYTM_MERCHANT_KEY, function (err, result)
    {
        var toSend = {};
        for (name in result)
        {
            if (name == 'PAYTM_MERCHANT_KEY') {
            }else
            {
                toSend[name] = result[name] ;
            }
        }
        // console.log(toSend);
        // res.render('pgredirect.ejs',{ 'restdata' : result });
        res.send(toSend);
    });
    //
    // console.log("POST Order end");
    // { ORDER_ID: 'vidisha123',
    //     CUST_ID: 'cust001',
    //     INDUSTRY_TYPE_ID: 'Retail',
    //     CHANNEL_ID: 'WAP',
    //     TXN_AMOUNT: '100',
    //     MID: 'GrubXS78081696633587',
    //     WEBSITE: 'http://app.grubx.in/',
    //     PAYTM_MERCHANT_KEY: 'j31Do59VDDYkNXex',
    //     CALLBACK_URL: 'http://localhost:5000/response' }


});

app.post('/response', function(req,res){
    console.log("in response post");
    var paramlist = req.body;
    var paramarray = new Array();
    console.log(paramlist);
    if(checksum.verifychecksum(paramlist, config.PAYTM_MERCHANT_KEY))
    {

        console.log("true");
        res.render('response.ejs',{ 'restdata' : "true" ,'paramlist' : paramlist});
    }else
    {
        console.log("false");
        res.render('response.ejs',{ 'restdata' : "false" , 'paramlist' : paramlist});
    }
});

app.get("/register", function(req, res){
    res.render("register");
});

app.get("/", function(req,res){
    res.render("home");
});

app.post("/register", function(req,res){
    User.register(new User({
        username : req.body.username,
        email : req.body.email,
        name: req.body.name,
        phoneNumber: req.body.phone
    }), req.body.password, function(err, user){
        if (err){
            console.log(err);
            res.render('register');
        }
        else {
            console.log("user registered");
            passport.authenticate("local")(req,res, function(){
                res.redirect("secret");
            })
        }
    });
    console.log("Posted");
});

app.post("/api/register", function(req,res){
    User.register(new User({
        username : req.body.username,
        email : req.body.email,
        name: req.body.name,
        phoneNumber: req.body.phone
    }), req.body.password, function(err, user){
        if (err){
            res.status(400).send(err);
        }
        else {
            console.log("user registered");
            passport.authenticate("local")(req,res, function(){
                res.status(200).send(req.user);
            })
        }
    });
});

app.post('/api/login', function(req,res){
    console.log(req.body);
    passport.authenticate("local")(req,res, function(){
        res.status(200).send(req.user);
    })

});

app.get('/paymentForm', function(req,res){
    res.render('paymentForm', {config: config});
})


app.get('/successApi', function(req,res){
    res.status(200).json(req.user);
});

app.get('/failureApi', function(req,res){
    res.status(400).send("Failed");
});


app.get("/secret", function(req,res){
    res.render("secret");
});

app.get("/login", function(req,res){
    res.render('login');
});

app.post('/login', passport.authenticate("local", {
    successRedirect : "/secret",
    failureRedirect: "/login"
}),function(req,res){

});

app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
});


app.post("/newOrder", function(req, res){
    if (typeof(req.body.items) === "string") {
        req.body.items = JSON.parse(req.body.items);
        // console.log(req.body);
    }
    req.body.status = 0;
    let newOrder = new Order(req.body);
    newOrder.save(function (err, order) {
        if (err) {
            console.log(err);
            res.send(err);
        }

        User.findOne({username : req.body.username }, function(err, User){
            if (err) console.log(err);
            else {
                User.orders.push(order);
                res.send(order);

            }
        });
    });
})

app.post("/showOrders", function(req, res){
    User.findOne({username: req.body.username}).populate("orders").exec(function(err, user){
        if (err) console.log(err);
        res.send(user.orders);
    })
})


////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var port = process.env.PORT || 5000;


app.listen(port, function(){
    console.log("Running on port " + port);
});
