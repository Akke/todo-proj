"use strict"

import path, { dirname } from "path"
import { fileURLToPath } from "url"

import express from "express"
import expressValidator from "express-validator"
import session from "express-session"
import passport from "passport"
import mongoose from "mongoose"
import bodyParser from "body-parser"
import authMiddleware from "./middleware/auth.js"

import User from "./models/user.js"
import Task from "./models/task.js"

const app = express()
const router = express.Router()
const { check, validationResult } = expressValidator
const port = 3000
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

import config from "./config.js"

let userData = null

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: "213123132132" 
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(express.static(path.join(__dirname, "../client/public")))

app.set("views", path.join(__dirname, "../client/views"))
app.set("view engine", "ejs")

app.get("/", function(req, res) {
    res.render("pages/auth")
});

app.get("/logout", function(req, res) {
    if(req.session) {
      req.session.destroy();
    }

    res.redirect("/")
});

app.get("/tasks", authMiddleware, async function(req, res) {
  const taskDocs = await Task.find({ "owner": userData._id }).sort({ timestamp: -1 })
  
  /* Boards */
  let boards = []
  taskDocs.forEach((t) => {
    boards.push(t.board)
  })

  boards = [...new Set(boards)]

  /* Categories */
  let categories = []
  taskDocs.forEach((t) => {
    categories.push(t.category)
  })

  categories = [...new Set(categories)]

  /* Render */
  res.render("pages/tasks", {
    user: userData,
    tasks: taskDocs,
    boards: boards,
    unsortedCategories: categories,
    categories: categories,
    boardName: "",
    categoryName: ""
  });
});

app.get("/tasks/:boardName", authMiddleware, async function(req, res) {
  const taskDocs = await Task.find({ "owner": userData._id }).sort({ timestamp: -1 })

  // Boards
  let boards = []
  taskDocs.forEach((t) => {
    boards.push(t.board)
  })

  boards = [...new Set(boards)]

  const filteredByBoard = taskDocs.filter((f) => {
    return f.board.toLowerCase() == req.params.boardName.toLowerCase()
  })

  // Categories
  let categories = []
  filteredByBoard.forEach((t) => {
    categories.push(t.category)
  })

  categories = [...new Set(categories)]

  let unsortedCategories = []
  taskDocs.forEach((t) => {
    unsortedCategories.push(t.category)
  })

  res.render("pages/tasks", {
    user: userData,
    tasks: filteredByBoard,
    boards: boards,
    unsortedCategories: unsortedCategories,
    categories: categories,
    boardName: req.params.boardName.toLowerCase(),
    categoryName: ""
  });
});

app.get("/tasks/:boardName/:categoryName", authMiddleware, async function(req, res) {
  const taskDocs = await Task.find({ "owner": userData._id }).sort({ timestamp: -1 })

  /* Boards */
  let boards = []
  taskDocs.forEach((t) => {
    boards.push(t.board)
  })

  boards = [...new Set(boards)]

  /* Tasks */
  const filteredByBoard = taskDocs.filter((f) => {
    return f.board.toLowerCase() == req.params.boardName.toLowerCase()
  })

  const tasksByCategory = filteredByBoard.filter((f) => {
    return f.category.toLowerCase() == req.params.categoryName.toLowerCase()
  })

  /* Categories */
  let categories = []
  tasksByCategory.forEach((t) => {
    categories.push(t.category)
  })

  categories = [...new Set(categories)]

  let unsortedCategories = []
  taskDocs.forEach((t) => {
    unsortedCategories.push(t.category)
  })

  res.render("pages/tasks", {
    user: userData,
    tasks: tasksByCategory,
    boards: boards,
    unsortedCategories: unsortedCategories,
    categories: categories,
    boardName: req.params.boardName.toLowerCase(),
    categoryName: req.params.categoryName.toLowerCase()
  });
});

app.post("/api/tasks/create", authMiddleware, [
  check("name")
    .escape()
    .notEmpty()
    .withMessage("Name must not be empty.")
    .isLength({ min: 3, max: 192 })       
    .withMessage("Name must be between 3 and 32 characters.")
    .matches(/^[A-Za-z0-9 .,'!&:()]+$/),
  check("board")
    .escape()
    .notEmpty()
    .withMessage("Board must not be empty.")
    .isLength({ min: 3, max: 32 })       
    .withMessage("Board must be between 3 and 32 characters.")
    .matches(/^[A-Za-z0-9 .,'!&]+$/),
  check("category")
    .escape()
    .notEmpty()
    .withMessage("Category must not be empty.")
    .isLength({ min: 3, max: 32 })       
    .withMessage("Category must be between 3 and 32 characters.")
    .matches(/^[A-Za-z0-9 .,'!&]+$/),
], function(req, res) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
   res.status(400).send(err.mapped())
   return
  }

  const body = req.body

  const task = new Task({
    creator: {
      name: userData.displayName
    },
    title: body.name,
    timestamp: Date.now(),
    board: body.board.toLowerCase(),
    category: body.category.toLowerCase(),
    color: "000000",
    order: 0
  })

  task.save().then((e) => {
    res.status(200).send({
      id: task._id,
      name: task.title
    })
  }).catch((e) => {
    res.status(400).send({
      message: "could not insert row"
    })
  })
})

app.post("/api/tasks/complete", authMiddleware, [
  check("id")
    .escape()
    .notEmpty()
    .withMessage("ID must not be empty.")
    .isLength({ min: 1, max: 32 })       
    .withMessage("ID must be between 1 and 32 characters.")
    .matches(/^[a-zA-Z0-9_.-]*$/),
], function(req, res) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
   res.status(400).send(err.mapped())
   return
  }

  const body = req.body
  const id = body.id 

  if(!mongoose.isValidObjectId(id)) {
    res.status(400).send({
      message: "invalid object id"
    })
    return
  }

  const user = User.find({ name: userData.displayName }).then((user) => {
    const task = Task.deleteOne({ _id: mongoose.Types.ObjectId(id), creator: { name: user[0].name } })

    task.then(() => {
      res.status(200).send({
        message: "deletion successful"
      })
    }).catch((e) => {
      res.status(400).send({
        message: "could not delete task"
      })
    })
  }).catch((e) => {
    res.status(400).send({
      message: "could not find user"
    })
  })
})

app.post("/api/tasks/updateColor", authMiddleware, [
  check("id")
    .escape()
    .notEmpty()
    .withMessage("ID must not be empty.")
    .isLength({ min: 1, max: 32 })       
    .withMessage("ID must be between 1 and 32 characters.")
    .matches(/^[a-zA-Z0-9_.-]*$/),
  check("color")
    .escape()
    .notEmpty()
    .withMessage("Color must not be empty.")
    .isLength({ min: 6, max: 6 })       
    .withMessage("ID must be 6 characters long.")
    .matches(/^[a-zA-Z0-9_.-]*$/),
], function(req, res) {
  const err = validationResult(req);
  if (!err.isEmpty()) {
   res.status(400).send(err.mapped())
   return
  }

  const body = req.body
  const id = body.id 
  const color = body.color

  if(!mongoose.isValidObjectId(id)) {
    res.status(400).send({
      message: "invalid object id"
    })
    return
  }

  const user = User.find({ name: userData.displayName }).then((user) => {
    const task = Task.findOneAndUpdate({ _id: mongoose.Types.ObjectId(id), creator: { name: user[0].name } }, {
      color: color
    })

    console.log(task)

    task.then(() => {
      res.status(200).send({
        message: "update successful"
      })
    }).catch((e) => {
      res.status(400).send({
        message: "could not update color"
      })
    })
  })
})

app.get("/success", authMiddleware, async (req, res) => {
  res.redirect("/tasks")
});
app.get("/error", (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

import _GoogleStrategy from "passport-google-oauth"
const GoogleStrategy = _GoogleStrategy.OAuth2Strategy

passport.use(new GoogleStrategy({
    clientID: config.google.clientId,
    clientSecret: config.google.clientSecret,
    callbackURL: `${config.url}/${config.google.callbackUrl}`
  },
  async function(accessToken, refreshToken, profile, done) {
    const user = await User.findOne({ token: accessToken });
    if(user) {
      userData = {
        _id: user._id,
        displayName: user.name
      }

      return done(null, userData);
    }

    const newUser = new User({
      name: profile.displayName,
      token: accessToken
    })

    await newUser.save()

    userData = {
      _id: newUser._id,
      displayName: newUser.name
    }

    return done(null, newUser);
  }
));

/**
* STEAM LOGIN
*/
import SteamStrategy from "passport-steam"
passport.use(new SteamStrategy({
    returnURL: `${config.url}/${config.steam.returnUrl}`,
    realm: config.url,
    apiKey: config.steam.apiKey
  },
  async function(identifier, profile, done) {
    const user = await User.findOne({ token: identifier });
    if(user) {
      userData = {
        _id: user._id,
        displayName: user.name
      }

      return done(null, userData);
    }

    const newUser = new User({
      name: profile.displayName,
      token: identifier
    })

    await newUser.save()

    userData = {
      _id: newUser._id,
      displayName: newUser.name
    }

    return done(null, newUser);
  }
));

app.get('/auth/steam',
  passport.authenticate('steam'),
  function(req, res) {
    // The request will be redirected to Steam for authentication, so
    // this function will not be called.
  });

app.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/tasks');
  });
/**/

/**
* DISCORD LOGIN
*/
import _DiscordStrategy from "passport-discord"
const DiscordStrategy = _DiscordStrategy.Strategy
const scopes = ['identify', 'email', 'guilds', 'guilds.join']

passport.use(new DiscordStrategy({
    clientID: config.discord.clientId,
    clientSecret: config.discord.clientSecret,
    callbackURL: `${config.url}/${config.discord.callbackUrl}`,
    scope: scopes
},
async function(accessToken, refreshToken, profile, done) {
    const user = await User.findOne({ token: accessToken });
    if(user) {
      userData = {
        _id: user._id,
        displayName: user.name
      }
      return done(null, userData);
    }

    const newUser = new User({
      name: profile.username,
      token: accessToken
    })

    await newUser.save()

    userData = {
      _id: newUser._id,
      displayName: newUser.name
    }

    return done(null, newUser);
}));

app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), function(req, res) {
    res.redirect('/tasks') // Successful auth
});
/**/

async function main() {
  await mongoose.connect("mongodb://localhost:27017/attgora")
}

app.listen(port, async () => {
  main().catch(err => console.log(err))
  
  console.log("App listening on port " + port)
});
 
app.get("/auth/google", 
  passport.authenticate("google", { scope : ["profile", "email"] }));
 
app.get("/auth/google/callback", 
  passport.authenticate("google", { failureRedirect: "/error" }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect("/success");
  });

