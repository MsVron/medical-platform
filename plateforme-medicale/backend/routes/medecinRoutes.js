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
router.get('/medecin/dashboard', verifyToken, medecinController.getCurrentMedecin);
router.get('/medecin/institutions', verifyToken, medecinController.getDoctorInstitutions);
router.get('/medecin/disponibilites', verifyToken, medecinController.getAvailabilities);
router.post('/medecin/disponibilites', verifyToken, medecinController.addAvailability);
router.put('/medecin/disponibilites/:id', verifyToken, medecinController.updateAvailability);
router.delete('/medecin/disponibilites/:id', verifyToken, medecinController.deleteAvailability);
router.get('/medecin/absences', verifyToken, medecinController.getEmergencyAbsences);
router.post('/medecin/absences', verifyToken, medecinController.addEmergencyAbsence);
router.delete('/medecin/absences/:id', verifyToken, medecinController.deleteEmergencyAbsence);

module.exports = router;