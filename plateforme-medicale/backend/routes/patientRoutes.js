const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { verifyToken, isSuperAdmin } = require('../middlewares/auth');

router.get('/patients', verifyToken, isSuperAdmin, patientController.getPatients);
router.post('/patients', verifyToken, isSuperAdmin, patientController.addPatient);
router.put('/patients/:id', verifyToken, isSuperAdmin, patientController.editPatient);
router.delete('/patients/:id', verifyToken, isSuperAdmin, patientController.deletePatient);

module.exports = router;