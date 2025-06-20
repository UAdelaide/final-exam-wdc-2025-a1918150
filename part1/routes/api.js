var express = require('express');
var router = express.Router();
var mysql = require('mysql2/promise');


/* GET API listing. */
router.get('/', function(req, res, next) {
  res.send('Response from API endpoint');
});


let db;

(async () => {
  try {
    // Now connect to the created database
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'DogWalkService'
    });


    // Insert data if table is empty for Users
    const [users] = await db.execute('SELECT COUNT(*) AS count FROM Users');
    if (users[0].count === 0) {
        try {
            await db.execute(`
                INSERT INTO Users (username, email, password_hash, role)
VALUES
("alice123", "alice@example.com", "hashed123", "owner"),
("bobwalker", "bob@example.com", "hashed456", "walker"),
("carol123", "carol@example.com", "hashed789", "owner"),
("davidwalker", "david@example.com", "hashed123", "walker"),
("emilyowner", "emily@example.com", "hashed456", "owner");
            `);
        } catch (err) {
          console.error('Error inserting initial data into Users table:', err);
        }

    }


    // Insert data if table is empty for Dogs
    const [dogs] = await db.execute('SELECT COUNT(*) AS count FROM Dogs');
    if (dogs[0].count === 0) {
        try {
            await db.execute(`
                INSERT INTO Dogs (name, size, owner_id)
                    VALUES
                    ("Max", "medium", (SELECT user_id FROM Users WHERE username = "alice123")),
                    ("Bella", "small", (SELECT user_id FROM Users WHERE username = "carol123")),
                    ("Charlie", "large", (SELECT user_id FROM Users WHERE username = "emilyowner")),
                    ("Daisy", "medium", (SELECT user_id FROM Users WHERE username = "alice123")),
                    ("Oscar", "small", (SELECT user_id FROM Users WHERE username = "carol123"));
            `);
        } catch (err) {
          console.error('Error inserting initial data into dogs table:', err);
        }

    }



    // Insert data if table is empty for WalkRequests
    const [walkRequests] = await db.execute('SELECT COUNT(*) AS count FROM WalkRequests');
    if (walkRequests[0].count === 0) {
        try {
            await db.execute(`
                Insert into Users (username, email, password_hash, role)
                    Values
                    ("alice123", "alice@example.com", "hashed123", "owner"),
                    ("bobwalker", "bob@example.com", "hashed456", "walker"),
                    ("carol123", "carol@example.com", "hashed789", "owner"),
                    ("davidwalker", "david@example.com", "hashed123", "walker"),
                    ("emilyowner", "emily@example.com", "hashed456", "owner");
            `);
        } catch (err) {
          console.error('Error inserting initial data into WalkRequests table:', err);
        }

    }
  } catch (err) {
    console.error('Error setting up database. Ensure Mysql is running: service mysql start', err);
  }
})();

// Route to return books as JSON
router.get('/', async (req, res) => {
    try {
        const
    } catch (error) {

    }
});

module.exports = router;
