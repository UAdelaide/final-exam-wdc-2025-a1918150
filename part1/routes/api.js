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
                INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
                    VALUES
                    ((SELECT dog_id FROM Dogs WHERE name = "Max"), "2025-06-10 08:00:00", 30, "Parklands", "open"),
                    ((SELECT dog_id FROM Dogs WHERE name = "Bella"), "2025-06-10 09:30:00", 45, "Beachside Ave", "accepted"),
                    ((SELECT dog_id FROM Dogs WHERE name = "Charlie"), "2025-06-11 10:00:00", 60, "City Gardens", "completed"),
                    ((SELECT dog_id FROM Dogs WHERE name = "Daisy"), "2025-06-12 14:30:00", 40, "Riverside Trail", "cancelled"),
                    ((SELECT dog_id FROM Dogs WHERE name = "Oscar"), "2025-06-13 07:45:00", 35, "Lakeview Park", "open");
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
router.get('/dogs', async (req, res) => {
    try {
        const [dogs] = await db.execute(`SELECT d.name AS dog_name, d.size, u.username AS owner_username
                                            FROM Dogs AS d
                                            JOIN Users AS u ON d.owner_id = u.user_id`);
        res.json(dogs);
    } catch (error) {
        console.error('Error fetching dogs:', error);
        res.status(500).json({ error: 'Failed to fetch dogs' });
    }
});

router.get('/walkrequests/open', async (req, res) => {
    try {
        const [wr] = await db.execute(`SELECT wr.request_id, d.name AS dog_name, wr.requested_time, wr.duration_minutes, wr.location, u.username AS owner_username
                                        FROM WalkRequests AS wr
                                        JOIN Dogs AS d ON wr.dog_id = d.dog_id
                                        JOIN Users AS u ON d.owner_id = u.user_id
                                        WHERE wr.status = "open"`);
        res.json(wr);
    } catch (error) {
        console.error('Error fetching walkrequests which are open:', error);
        res.status(500).json({ error: 'Failed to fetch walkrequests which are open' });
    }
});

router.get('/walkers/summary', async (req, res) => {
    try {
        const [ws] = await db.execute(`SELECT u.username AS walker_username, COUNT(r.rating) AS total_ratings, ROUND(AVG(r.rating),1) AS average_rating, COUNT(w.request_id) AS completed_walks
                                        FROM Users AS u
                                        LEFTJOIN WalkRatings AS r ON u.user_id = r.walker_id
                                        LEFT JOIN WalkRequests AS w ON w.request_id = r.request_id AND w.status = "completed"
                                        WHERE u.role = "walker"
                                        GROUP BY u.user_id`);
        res.json(ws);
    } catch (error) {
        console.error('Error fetching summary of each walker with their average rating and number of completed walks:', error);
        res.status(500).json({ error: 'Failed to fetch summary of each walker with their average rating and number of completed walks' });
    }
});

module.exports = router;
