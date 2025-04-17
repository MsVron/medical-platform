const express = require('express');
const router = express.Router();
const institutionController = require('../controllers/institutionController');
const { verifyToken, isAdmin, isSuperAdmin } = require('../middlewares/auth');

// Get institutions
router.get('/institutions', verifyToken, institutionController.getInstitutions);

// Add institution
router.post('/institutions', verifyToken, isAdmin, institutionController.addInstitution);

// Edit institution (super_admin can edit all fields, admin can edit non-critical)
router.put('/institutions/:id', verifyToken, isAdmin, institutionController.editInstitution);

// Delete institution (super_admin only)
router.delete('/institutions/:id', verifyToken, isSuperAdmin, institutionController.deleteInstitution);

module.exports = router;