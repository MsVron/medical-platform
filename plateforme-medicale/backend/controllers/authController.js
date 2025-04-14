const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

console.log('DB imported:', db);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Defined' : 'Undefined');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Nom d'utilisateur et mot de passe requis" });
    }

    // Trim password to avoid whitespace issues
    const trimmedPassword = password.trim();
    console.log('Login attempt:', { username, password: trimmedPassword, passwordLength: trimmedPassword.length, passwordType: typeof trimmedPassword });

    // Vérifier si l'utilisateur existe
    const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    console.log('Query result:', users);

    if (users.length === 0) {
      return res.status(401).json({ message: "Nom d'utilisateur ou mot de passe incorrect" });
    }

    const user = users[0];

    // Comparer le mot de passe fourni avec le hash stocké
    const isPasswordValid = await bcrypt.compare(trimmedPassword, user.password);
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
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Retourner les informations de l'utilisateur et le token
    return res.status(200).json({
      message: "Connexion réussie",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', {
      message: error.message,
      stack: error.stack,
      username: req.body?.username
    });
    return res.status(500).json({ message: "Erreur lors de la connexion", error: error.message });
  }
};