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


    // Insert data if table is empty
    const [users] = await db.execute('SELECT COUNT(*) AS count FROM Users');
    if (users[0].count === 0) {
      await db.execute(`
        Insert into Users (username, email, password_hash, role)
            Values
            ("alice123", "alice@example.com", "hashed123", "owner"),
            ("bobwalker", "bob@example.com", "hashed456", "walker"),
            ("carol123", "carol@example.com", "hashed789", "owner"),
            ("davidwalker", "david@example.com", "hashed123", "walker"),
            ("emilyowner", "emily@example.com", "hashed456", "owner");
      `);
    }
  } catch (err) {
    console.error('Error setting up database. Ensure Mysql is running: service mysql start', err);
  }
})();

// Route to return books as JSON
router.get('/', async (req, res) => {
  try {
    const [books] = await db.execute('SELECT * FROM books');
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

module.exports = router;
