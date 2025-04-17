const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to verify JWT token
exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    const token = authHeader.split(' ')[1];

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET non défini dans .env');
      return res.status(500).json({ message: 'Erreur de configuration du serveur' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      nom_utilisateur: decoded.nom_utilisateur,
      role: decoded.role,
      prenom: decoded.prenom,
      nom: decoded.nom,
      id_specifique_role: decoded.id_specifique_role // Add this
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expirée, veuillez vous reconnecter' });
    }
    console.error('Erreur d\'authentification :', error);
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

// Super Admin only
exports.isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: "Accès réservé aux super administrateurs" });
  }
  next();
};

// Admin or Super Admin
exports.isAdmin = (req, res, next) => {
  if (!['admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ message: "Accès réservé aux administrateurs" });
  }

  // Restriction: admin can't modify patients
  if (
    req.user.role === 'admin' &&
    ['POST', 'PUT', 'DELETE'].includes(req.method) &&
    req.originalUrl.includes('/patients')
  ) {
    return res.status(403).json({ message: "Les administrateurs ne peuvent pas modifier les patients" });
  }

  next();
};

// Médecin, Admin ou Super Admin
exports.isMedecin = (req, res, next) => {
  if (!['medecin', 'admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ message: "Accès réservé aux médecins" });
  }
  next();
};

// Patient, Admin ou Super Admin
exports.isPatient = (req, res, next) => {
  if (!['patient', 'admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ message: "Accès réservé aux patients" });
  }
  next();
};

// Institution, Admin ou Super Admin
exports.isInstitution = (req, res, next) => {
  if (!['institution', 'admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ message: "Accès réservé aux institutions médicales" });
  }
  next();
};
