const express = require('express');
const router = express.Router();
const medecinController = require('../controllers/medecinController');
const { verifyToken, isAdmin, isSuperAdmin, isInstitution } = require('../middleware/auth');

// Get doctors (super_admin/admin see all, institution sees their own)
router.get('/medecins', verifyToken, medecinController.getMedecins);

// Add doctor (super_admin can set all fields, admin can set non-critical)
router.post('/medecins', verifyToken, isAdmin, medecinController.addMedecin);

// Edit doctor (super_admin can edit all fields, admin can edit non-critical)
router.put('/medecins/:id', verifyToken, isAdmin, medecinController.editMedecin);

// Delete doctor (super_admin only)
router.delete('/medecins/:id', verifyToken, isSuperAdmin, medecinController.deleteMedecin);

module.exports = router;