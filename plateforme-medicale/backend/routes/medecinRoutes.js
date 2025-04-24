const express = require('express');
const router = express.Router();
const medecinController = require('../controllers/medecinController');
const { verifyToken, isAdmin, isSuperAdmin } = require('../middlewares/auth');

router.get('/medecins', verifyToken, isAdmin, medecinController.getMedecins);
router.post('/medecins', verifyToken, isAdmin, medecinController.addMedecin);
router.put('/medecins/:id', verifyToken, isAdmin, medecinController.editMedecin);
router.delete('/medecins/:id', verifyToken, isSuperAdmin, medecinController.deleteMedecin);
router.get('/specialites', verifyToken, isAdmin, medecinController.getSpecialites);
router.get('/institutions', verifyToken, isAdmin, medecinController.getInstitutions);
router.get('/medecin/dashboard', verifyToken, medecinController.getCurrentMedecin); // Added

module.exports = router;