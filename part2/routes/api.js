const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Route to return Dogs as JSON
router.get('/dogs', async (req, res) => {
    try {
        const [dogs] = await db.execute(`SELECT d.dog_id, d.name AS dog_name, d.size AS dog_size, d.owner_id AS owner_id
                                            FROM Dogs AS d
                                            JOIN Users AS u ON d.owner_id = u.user_id`);
        res.json(dogs);
    } catch (error) {
        console.error('Error fetching dogs:', error);
        res.status(500).json({ error: 'Failed to fetch dogs' });
    }
});

module.exports = router;
