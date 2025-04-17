const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: "Token d'authentification requis" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

exports.isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: "Accès réservé aux super administrateurs" });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (!['admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ message: "Accès réservé aux administrateurs" });
  }
  // Prevent admin from modifying patients
  if (req.user.role === 'admin' && ['POST', 'PUT', 'DELETE'].includes(req.method) && req.originalUrl.includes('/patients')) {
    return res.status(403).json({ message: "Les administrateurs ne peuvent pas modifier les patients" });
  }
  next();
};

exports.isMedecin = (req, res, next) => {
  if (!['medecin', 'admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ message: "Accès réservé aux médecins" });
  }
  next();
};

exports.isPatient = (req, res, next) => {
  if (!['patient', 'admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ message: "Accès réservé aux patients" });
  }
  next();
};

exports.isInstitution = (req, res, next) => {
  if (!['institution', 'admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ message: "Accès réservé aux institutions médicales" });
  }
  next();
};