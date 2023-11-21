const connectToDatabase = require("./db");
connectToDatabase();
const express = require("express")
const app = express();
const nocache = require("nocache")
const session = require("express-session")
const cookieParser = require('cookie-parser')
require('dotenv').config();
const config = require("./config/config")
const user_route = require("./routes/userRoute")
const admin_route = require("./routes/adminRoute")
const blocked = require('./middleware/blocked')


const path = require("path")
const morgan = require("morgan")

app.use(cookieParser());

app.use(
  session({
    secret: config.generateRandomString(32), // Provide your session secret
    resave: false, //  prevent unnecessary session saves
    saveUninitialized: false, // Set saveUninitialized to true to save new but uninitialized sessions
    cookie:{
      httpOnly: true, 
      maxAge: 3600000, 
      sameSite: 'strict'
      
    }
  })
);

app.use(nocache());
// app.use(morgan('tiny'))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));

app.use(blocked.isBlocked)

app.use("/", user_route);
app.use("/admin", admin_route);


app.use((req, res, next) => { 
  res.status(404).render('users/404') 
}) 


app.listen(process.env.PORT || 8000, () => {
  console.log("server is Running");
});


