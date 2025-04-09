const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth.controller');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db.config');

router.post('/register', auth.register);
router.post('/login', auth.login);

router.post('/login', (req, res) => {
    const { email, password } = req.body;
  
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' });
  
      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const user = results[0];
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ id: user.id }, 'your_jwt_secret', {
        expiresIn: '1h',
      });
  
      res.json({ token, user: { id: user.id, email: user.email } });
    });
  });
  
module.exports = router;
