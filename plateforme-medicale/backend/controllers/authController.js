const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

console.log('DB imported:', db);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Defined' : 'Undefined');

exports.login = async (req, res) => {
  try {
    const { nom_utilisateur, mot_de_passe } = req.body;

    // Validate input
    if (!nom_utilisateur || !mot_de_passe) {
      return res.status(400).json({ message: "Nom d'utilisateur et mot de passe requis" });
    }

    // Trim password to avoid whitespace issues
    const trimmedPassword = mot_de_passe.trim();
    console.log('Login attempt:', { nom_utilisateur, mot_de_passe: trimmedPassword, passwordLength: trimmedPassword.length, passwordType: typeof trimmedPassword });

    // Vérifier si l'utilisateur existe
    const [utilisateurs] = await db.execute(`
      SELECT u.*, sa.prenom, sa.nom
      FROM utilisateurs u
      LEFT JOIN super_admins sa ON u.role = 'super_admin' AND u.id_specifique_role = sa.id
      WHERE u.nom_utilisateur = ?
    `, [nom_utilisateur]);
    console.log('Query result:', utilisateurs);

    if (utilisateurs.length === 0) {
      return res.status(401).json({ message: "Nom d'utilisateur ou mot de passe incorrect" });
    }

    const user = utilisateurs[0];

    // Comparer le mot de passe fourni avec le hash stocké
    const isPasswordValid = await bcrypt.compare(trimmedPassword, user.mot_de_passe);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Nom d'utilisateur ou mot de passe incorrect" });
    }

    // Vérifier JWT_SECRET
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, nom_utilisateur: user.nom_utilisateur, role: user.role, prenom: user.prenom, nom: user.nom },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Retourner les informations de l'utilisateur et le token
    return res.status(200).json({
      message: "Connexion réussie",
      user: {
        id: user.id,
        nom_utilisateur: user.nom_utilisateur,
        email: user.email,
        role: user.role,
        prenom: user.prenom,
        nom: user.nom
      },
      token
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', {
      message: error.message,
      stack: error.stack,
      nom_utilisateur: req.body?.nom_utilisateur
    });
    return res.status(500).json({ message: "Erreur lors de la connexion", error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    return res.status(200).json({ message: "Déconnexion réussie" });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ message: "Erreur lors de la déconnexion", error: error.message });
  }
};