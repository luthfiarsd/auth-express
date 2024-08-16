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
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

const unauth = (req, res, next) => {
  if (req.session.user_id) {
    return res.redirect("/admin");
  }
  next();
};

app.get("/register", unauth, (req, res) => {
  res.render("register");
});

app.post("/register", unauth, async (req, res) => {
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

app.get("/login", unauth, (req, res) => {
  res.render("login");
});

app.post("/login", unauth, async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username: username });
  if (user) {
    const isMatch = bcrypt.compareSync(password, user.password);
    if (isMatch) {
      req.session.user_id = user._id;
      req.session.username = user.username;
      res.redirect("/admin");
    } else {
      res.redirect("/login");
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/", (req, res) => {
  const message = "HOMEPAGE";
  res.render("home", { message });
});

const auth = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  next();
};

app.get("/admin", auth, (req, res) => {
  res.render("admin");
});

// Contoh session ngabs
app.get("/profile/settings", auth, (req, res) => {
  res.send("PROFILE SETTINGS " + req.session.username);
});

app.post("/logout", auth, (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

app.listen(3000, () => {
  console.log("Port http://localhost:3000");
});
