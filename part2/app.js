const express = require('express');
const path = require('path');
const session = require('express-session');// Importing the express-session middleware
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());


//for the session management
app.use(
    session({
        secret: 'examsecretkey',// Uses a secret key for session signing
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }
    })
);



app.use(express.static(path.join(__dirname, '/public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);
app.use('/api', apiRoutes);

// Export the app instead of listening here
module.exports = app;
