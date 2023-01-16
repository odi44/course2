//jshint esversion:6
// pull in packages
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

// replace encrypt with md5
//const encrypt = require("mongoose-encryption");
// replace md5 with bcrypt
//const md5 = require("md5");
// replace bcrypt/salting with passport
//const bcrypt = require("bcrypt");
//const saltRounds = 10;

//*********************************************
// SETUP APP

// allow app to use express
const app = express();

// make our static pages publicly accessible
app.use(express.static("public"));

// employ ejs templates engine
app.set('view engine', 'ejs');

// use parser properly on posted data objects
app.use(bodyParser.urlencoded({
  extended: true
}));

// set up session in our app
app.use(session({
  secret: "Our little secret",
  resave: false,
  saveUninitialized: false
}));

// initialize passport, use passport to deal with sessions
app.use(passport.initialize());
app.use(passport.session());

//*********************************************
// SET UP DATABASE

// connect to dBase
//mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true});
mongoose.set('strictQuery', true);

//*********************************************
// SET UP USER ACCESS

// set up schema
// for encryption adopt new schema
// const userSchema = {
//   email: String,
//   password: String
// };
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

// enable & use passport/Mongoose support
userSchema.plugin(passportLocalMongoose);

// set up Mongoose model
const User = new mongoose.model("User", userSchema);

// apply Passport with Mongoose
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




//*********************************************
// RENDER ROUTE PAGES

// target root "home" route
app.get("/", function(rootRequest, rootResponse){
  rootResponse.render("home");
});

// target LOGIN route
app.get("/login", function(loginRequest, loginResponse){
  loginResponse.render("login");
});

// target REGISTER route
app.get("/register", function(registerRequest, registerResponse){
  registerResponse.render("register");
});

// target SECRETS route
app.get("/secrets", function(secretsRequest, secretsResponse) {
  if (secretsRequest.isAuthenticated()) {
    secretsResponse.render("secrets");
  } else {
    secretsResponse.redirect("/login");
  }
});

// target LOGOUT route
app.get("/logout", function(logoutRequest,logoutResponse){
  logoutRequest.logout(function(err){
    if (err){
      console.log(err);
    } else {
      logoutResponse.redirect("/");
    }
  });
});

//*********************************************
// CREATE NEW USER ACCT FROM REGISTER PAGE

app.post("/register", function(userRequest, userResponse){

  console.log("ENTERING APP.POST WITH USER CREDS!!");

  // REPLACE bcrypt/salting with passport
  // bcrypt.hash(userRequest.body.password, saltRounds, function(err, hash) {
  //
  //   // define user creds with bcrypt'd password
  //   const newUser = new User({
  //     email: userRequest.body.username,
  //     password: hash
  //   });
  //
  //   console.log("newUser created");
  //   console.log("email: " + userRequest.body.username);
  //   console.log("password: " + userRequest.body.password);
  //   console.log("bcrypted password: " + hash);
  //
  //   newUser.save(function(err){
  //     console.log("Inside newUser.save function...");
  //     if (err){
  //       console.log("There is an error!");
  //       console.log(err);
  //     } else {
  //       console.log("There is NO error!");
  //       userResponse.render("secrets");
  //     }
  //   });
  //
  // });

  // User registration using Passport/Mongoose
  User.register({username: userRequest.body.username}, userRequest.body.password, function(err, user) {
    if (err) {
      console.log(err);
      userResponse.redirect("/register");
      } else {
        passport.authenticate("local")(userRequest, userResponse, function(){
          userResponse.redirect("/secrets");
        });
      }
    });

});

//*********************************************
// CHECK LOGIN ATTEMPT

app.post("/login", function(req, res) {
  console.log("User has attempted a login...");

  // REPLACE bcrypt/salting with passport
  // //retrieve user creds
  // const username = req.body.username;
  // //const password = md5(req.body.password);
  // const password = req.body.password;
  //
  // // check if user is in dBase
  // User.findOne({email: username}, function(err, foundUser) {
  //   console.log("Inside User.findOne()...");
  //   if (err) {
  //     console.log("An error was found.");
  //     console.log(err);
  //   } else {
  //     if (foundUser) {
  //       console.log("User was found. Checking password..");
  //       //if (foundUser.password === password) {
  //       bcrypt.compare(password, foundUser.password, function(err, bcryptResponse) {
  //         if (err) {
  //           console.log("Password did NOT match.");
  //         } else {
  //           console.log("Password matches. foundUser = " + foundUser);
  //           res.render("secrets");
  //         }
  //       });
  //     }
  //   }
  //   console.log("After IF block...");
  // });
  // console.log("After findOne() block...");

  // create user based on login attempt creds
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});



app.listen(3000, function() {
  console.log("Server SECRETS started on port 3000.");
});
