const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");

const User = require("./models/user.js");

mongoose
  .connect("mongodb://127.0.0.1:27017/auth")
  .then((res) => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
}))

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const user = new User({
    username: username,
    password: hash,
  });

  await user.save();

  res.redirect("/");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username: username });
  if (user) {
    const isMatch = bcrypt.compareSync(password, user.password);
    if (isMatch) {
      res.redirect("/admin");
    } else {
      res.redirect("/login");
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/", (req, res) => {
  const message = "mantap";
  res.render("home", { message });
});

app.get("/admin", (req, res) => {
  res.send("Admin Page");
});

app.listen(3000, () => {
  console.log("Port http://localhost:3000");
});
