if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
  

const express = require('express');
const bcrypt = require('bcrypt');
const flash = require("express-flash");
const session = require("express-session");
const passport = require('passport');
const methodOverride = require("method-override");
const path = require('path')
const port = process.env.PORT || 3000
const Book = require('./models/book');

const app = express();

const bookRouter = require('./routes/books');

const initializePassport = require('./passport-config');
initializePassport(passport);

//USER MODEL
const User = require("./models/users");

// MONGO
const mongoose = require("mongoose");
  
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connected"))
  .catch((err) => console.log(err));

// PASSPORT
require("./passport-config")(passport);

app.set('view-engine', 'ejs');
app.use(express.static(path.join(__dirname,'public')))
app.use(express.urlencoded({ extended: false, limit:'500kb' }));

// USE
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

// app.get('/', (req, res) => {
//     res.render('index.ejs')
// })

app.get('/', async (req, res) => {
  const book = await Book.find().sort({ createdAt: 'desc' });
  res.render('index.ejs', {
      book: book
  });
});

app.get('/login', redirectLogin, (req, res) => {
    res.render('login.ejs')
})

app.post('/login',checkNotAuthenticated, passport.authenticate("local", {
  failureRedirect: "/login",
  failureFlash: true,
  successRedirect: "/books/allbooks",
})
)

app.get('/signup', checkNotAuthenticated, (req, res) => {
    res.render('signup.ejs')
})

app.post("/signup", checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
      });
      console.log(user);
      user.save();
      res.redirect("/login");
    } catch (err) {
        console.log(err);
      res.redirect("/signup");
    }
});

// SIGN-OUT
app.delete("/signout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});


app.use('/books', bookRouter);


//Middlewares
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/");
    }
    next();
  }

function redirectLogin (req, res, next) {
  if(req.isAuthenticated()) {
    return res.redirect('/books/dashboard')
  }
  next()
}

app.listen(port)