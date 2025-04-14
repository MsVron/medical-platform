const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route de connexion uniquement pour commencer
router.post('/login', authController.login);

module.exports = router;