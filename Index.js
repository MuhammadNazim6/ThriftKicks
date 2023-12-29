const connectToDatabase = require("./db");
connectToDatabase();
const express = require("express")
const app = express();
const nocache = require("nocache")
const session = require("express-session")
const cookieParser = require('cookie-parser')
require('dotenv').config();
require('./middleware/authGoogle')
const config = require("./config/config")
const user_route = require("./routes/userRoute")
const admin_route = require("./routes/adminRoute")

const path = require("path");
// =========================
const passport = require("passport");
// =========================


app.use(cookieParser());

app.use(
  session({
    secret: config.generateRandomString(32), 
    resave: false, 
    saveUninitialized: false, 
    cookie:{
      httpOnly: true, 
      maxAge: 3600000, 
      sameSite: 'strict'
      
    }
  })
);
app.use(nocache());

// =========================
app.use(passport.initialize())
// =========================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));


app.use("/", user_route);
app.use("/admin", admin_route);


app.use((req, res, next) => { 
  res.status(404).render('users/404') 
}) 


app.listen(process.env.PORT || 8000, () => {
  console.log("server is Running");
});


