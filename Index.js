const mongoose = require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/ecommerce_management_system")
const express = require("express")
const app = express();
const nocache = require("nocache")
const session = require("express-session")
const config = require("./config/config")
const user_route = require("./routes/userRoute")
const admin_route = require("./routes/adminRoute")
const path = require("path")
const morgan = require("morgan")

const multer = require('multer')

const storage = multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null, '/public/images')
  },
  filename: (req,file,cb)=>{
    console.log(file)
    cb(null,Date.now()+path.extname(file.originalname))
  }
})

const upload = multer({storage: storage})



app.use(
  session({
    secret: config.generateRandomString(32), // Provide your session secret
    resave: false, // Set resave to false to prevent unnecessary session saves
    saveUninitialized: false, // Set saveUninitialized to true to save new but uninitialized sessions
  })
);
app.use(nocache());  
// app.use(morgan('tiny'))
console.log(config.generateRandomString(32)); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "/public")));


app.use("/", user_route);
app.use("/admin", admin_route);

app.listen(8000, () => {
  console.log("server is Running");
});


