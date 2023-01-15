//jshint esversion:6
// pull in packages
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

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

//const secret = "Thisisourlittlesecrete.";
const secret = process.env.SECRET;
userSchema.plugin(encrypt, {secret: secret, encryptedFields: ['password']});

// set up model
const User = new mongoose.model("User", userSchema);




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


//*********************************************
// CREATE NEW USER ACCT FROM REGISTER PAGE

app.post("/register", function(userRequest, userResponse){

  console.log("ENTERING APP.POST WITH USER CREDS!!");

  const newUser = new User({
    email: userRequest.body.username,
    password: userRequest.body.password
  });

  console.log("newUser created");
  console.log("email: " + userRequest.body.username);
  console.log("password: " + userRequest.body.password);

  newUser.save(function(err){
    console.log("Inside newUser.save function...");
    if (err){
      console.log("There is an error!");
      console.log(err);
    } else {
      console.log("There is NO error!");
      userResponse.render("secrets");
    }
  });
});

//*********************************************
// CHECK LOGIN ATTEMPT

app.post("/login", function(req, res) {
  console.log("User has attempted a login...");

  //retrieve user creds
  const username = req.body.username;
  const password = req.body.password;

  // check if user is in dBase
  User.findOne({email: username}, function(err, foundUser) {
    console.log("Inside User.findOne()...");
    if (err) {
      console.log("An error was found.");
      console.log(err);
    } else {
      if (foundUser) {
        console.log("User was found. Checking password..");
        if (foundUser.password === password) {
          console.log("Password matches. foundUser = " + foundUser);
          res.render("secrets");
        } else {
          console.log("Password did NOT match.");
        }
      }
    }
    console.log("After IF block...");
  });
  console.log("After findOne() block...");
});



app.listen(3000, function() {
  console.log("Server SECRETS started on port 3000.");
});
