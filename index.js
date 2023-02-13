const express = require('express');
const app = express();
const { User, sequelize } = require('./db');
const bcrypt = require('bcrypt');

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/', async (req, res, next) => {
  try {
    res.send('<h1>Welcome to Loginopolis!</h1><p>Log in via POST /login or register via POST /register</p>');
  } catch (error) {
    console.error(error);
    next(error)
  }
});


// POST /register
// TODO - takes req.body of {username, password} and creates a new user with the hashed password
app.post('/register', async (req, res, next) => {
  try {
    await sequelize.sync({force: true});
    const { username, password } = req.body;
    // Hash the password with bcrypt.hash
    const hashedPassword = await bcrypt.hash(password, 10);
    // Call User.create (User is already imported above)
    const user = await User.create({ username : username, password: hashedPassword });
    // Send back a success message (a string) per the test specs.
    console.log(user)
    res.send(`successfully created user ${user.username}`);
  } catch (error) {
    console.error(error);
    next(error)
  }
});

// POST /login
// TODO - takes req.body of {username, password}, finds user by username, and compares the password with the hashed version from the DB

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(401).send("incorrect username or password");
    }

    // Compare the submitted password to the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send( "incorrect username or password");
    }

    // If the username and password match, return a success message
    res.status(200).send(`successfully logged in user ${user.username}`);
  } catch (error) {
    console.error(error);
    return res.status(500).send("An error occurred");
  }
});
// we export the app, not listening in here, so that we can run tests
module.exports = app;
