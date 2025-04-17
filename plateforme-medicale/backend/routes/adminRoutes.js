const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isSuperAdmin } = require('../middleware/auth');

router.post('/admins', verifyToken, isSuperAdmin, adminController.addAdmin);
router.put('/admins/:id', verifyToken, isSuperAdmin, adminController.editAdmin);
router.delete('/admins/:id', verifyToken, isSuperAdmin, adminController.deleteAdmin);
router.get('/admins', verifyToken, isSuperAdmin, adminController.getAdmins);

module.exports = router;