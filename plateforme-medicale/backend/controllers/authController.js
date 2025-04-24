const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// -------- AUTH: LOGIN --------
exports.login = async (req, res) => {
  try {
    const { nom_utilisateur, mot_de_passe } = req.body;

    if (!nom_utilisateur || !mot_de_passe) {
      return res.status(400).json({ message: "Nom d'utilisateur et mot de passe requis" });
    }

    const [utilisateurs] = await db.execute(`
      SELECT
        u.id, u.nom_utilisateur, u.mot_de_passe, u.email, u.role, u.id_specifique_role,
        COALESCE(sa.prenom, a.prenom, m.prenom, p.prenom, i.nom) AS prenom,
        COALESCE(sa.nom, a.nom, m.nom, p.nom, '') AS nom
      FROM utilisateurs u
      LEFT JOIN super_admins sa ON u.role = 'super_admin' AND u.id_specifique_role = sa.id
      LEFT JOIN admins a ON u.role = 'admin' AND u.id_specifique_role = a.id
      LEFT JOIN medecins m ON u.role = 'medecin' AND u.id_specifique_role = m.id
      LEFT JOIN patients p ON u.role = 'patient' AND u.id_specifique_role = p.id
      LEFT JOIN institutions i ON u.role = 'institution' AND u.id_specifique_role = i.id
      WHERE u.nom_utilisateur = ?
    `, [nom_utilisateur]);

    if (utilisateurs.length === 0) {
      return res.status(401).json({ message: "Nom d'utilisateur ou mot de passe incorrect" });
    }

    const user = utilisateurs[0];
    const isPasswordValid = await bcrypt.compare(mot_de_passe.trim(), user.mot_de_passe);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Nom d'utilisateur ou mot de passe incorrect" });
    }

    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not defined');

    const token = jwt.sign(
      {
        id: user.id,
        nom_utilisateur: user.nom_utilisateur,
        role: user.role,
        prenom: user.prenom,
        nom: user.nom,
        id_specifique_role: user.id_specifique_role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: "Connexion réussie",
      user: {
        id: user.id,
        nom_utilisateur: user.nom_utilisateur,
        email: user.email,
        role: user.role,
        prenom: user.prenom,
        nom: user.nom,
        id_specifique_role: user.id_specifique_role // Include for completeness
      },
      token
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return res.status(500).json({ message: "Erreur lors de la connexion", error: error.message });
  }
};

// -------- AUTH: LOGOUT --------
exports.logout = async (req, res) => {
  try {
    return res.status(200).json({ message: "Déconnexion réussie" });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return res.status(500).json({ message: "Erreur lors de la déconnexion", error: error.message });
  }
};