const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const users = require('../config/users');

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Find the user from hardcoded config (case-insensitive)
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
    }


    if (password !== user.password) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
        user: {
            id: user.id,
            username: user.username,
            role: user.role
        },
    };

    // Sign Token
    jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
        (err, token) => {
            if (err) throw err;
            res.json({ token, user: payload.user });
        }
    );
});

module.exports = router;
