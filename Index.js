const connectToDatabase = require("./db");
connectToDatabase();
const express = require("express")
const app = express();
const nocache = require("nocache")
const session = require("express-session")
const config = require("./config/config")
const user_route = require("./routes/userRoute")
const admin_route = require("./routes/adminRoute")
const path = require("path")
const morgan = require("morgan")

app.use(
  session({
    secret: config.generateRandomString(32), // Provide your session secret
    resave: false, //  prevent unnecessary session saves
    saveUninitialized: false, // Set saveUninitialized to true to save new but uninitialized sessions
  })
);
app.use(nocache());  
// app.use(morgan('tiny'))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));

app.use("/", user_route);
app.use("/admin", admin_route);
app.listen(8000, () => {
  console.log("server is Running");
});


