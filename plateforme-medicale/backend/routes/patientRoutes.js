const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { verifyToken, isAdmin, isSuperAdmin, isMedecin, isInstitution } = require('../middlewares/auth');

// Get patients (restricted by role: super_admin/admin see all, medecin/institution see their own)
router.get('/patients', verifyToken, patientController.getPatients);

// Add patient (super_admin only)
router.post('/patients', verifyToken, isSuperAdmin, patientController.addPatient);

// Edit patient (super_admin only)
router.put('/patients/:id', verifyToken, isSuperAdmin, patientController.editPatient);

// Delete patient (super_admin only)
router.delete('/patients/:id', verifyToken, isSuperAdmin, patientController.deletePatient);

module.exports = router;