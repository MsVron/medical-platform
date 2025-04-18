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
      SELECT u.*, sa.prenom, sa.nom
      FROM utilisateurs u
      LEFT JOIN super_admins sa ON u.role = 'super_admin' AND u.id_specifique_role = sa.id
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
        nom: user.nom
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

// -------- ADMIN: CREATE --------
exports.addAdmin = async (req, res) => {
  try {
    const { nom_utilisateur, mot_de_passe, email, prenom, nom, telephone, institution_id } = req.body;

    if (!nom_utilisateur || !mot_de_passe || !email || !prenom || !nom) {
      return res.status(400).json({ message: "Tous les champs obligatoires doivent être fournis" });
    }

    const [existingUsers] = await db.execute(
      'SELECT id FROM utilisateurs WHERE nom_utilisateur = ? OR email = ?',
      [nom_utilisateur, email]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Nom d'utilisateur ou email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    const [adminResult] = await db.execute(
      'INSERT INTO admins (prenom, nom, telephone, cree_par, institution_id) VALUES (?, ?, ?, ?, ?)',
      [prenom, nom, telephone || null, req.user.id_specifique_role, institution_id || null]
    );

    await db.execute(
      'INSERT INTO utilisateurs (nom_utilisateur, mot_de_passe, email, role, id_specifique_role, est_actif) VALUES (?, ?, ?, ?, ?, ?)',
      [nom_utilisateur, hashedPassword, email, 'admin', adminResult.insertId, true]
    );

    return res.status(201).json({ message: "Administrateur ajouté avec succès" });

  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un administrateur:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// -------- ADMIN: UPDATE --------
exports.editAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { prenom, nom, telephone, email, institution_id, est_actif } = req.body;

    if (!prenom || !nom || !email) {
      return res.status(400).json({ message: "Prénom, nom et email sont obligatoires" });
    }

    const [admins] = await db.execute('SELECT id FROM admins WHERE id = ?', [id]);
    if (admins.length === 0) {
      return res.status(404).json({ message: "Administrateur non trouvé" });
    }

    await db.execute(
      'UPDATE admins SET prenom = ?, nom = ?, telephone = ?, institution_id = ? WHERE id = ?',
      [prenom, nom, telephone || null, institution_id || null, id]
    );

    await db.execute(
      'UPDATE utilisateurs SET email = ?, est_actif = ? WHERE id_specifique_role = ? AND role = ?',
      [email, est_actif !== undefined ? est_actif : true, id, 'admin']
    );

    return res.status(200).json({ message: "Administrateur mis à jour avec succès" });

  } catch (error) {
    console.error('Erreur lors de la modification d\'un administrateur:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// -------- ADMIN: DELETE --------
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const [admins] = await db.execute('SELECT id FROM admins WHERE id = ?', [id]);
    if (admins.length === 0) {
      return res.status(404).json({ message: "Administrateur non trouvé" });
    }

    await db.execute('DELETE FROM utilisateurs WHERE id_specifique_role = ? AND role = ?', [id, 'admin']);
    await db.execute('DELETE FROM admins WHERE id = ?', [id]);

    return res.status(200).json({ message: "Administrateur supprimé avec succès" });

  } catch (error) {
    console.error('Erreur lors de la suppression d\'un administrateur:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// -------- ADMIN: GET ALL --------
exports.getAdmins = async (req, res) => {
  try {
    const [admins] = await db.execute(`
      SELECT a.id, a.prenom, a.nom, a.telephone, a.institution_id, a.date_creation, u.email, u.est_actif
      FROM admins a
      JOIN utilisateurs u ON u.id_specifique_role = a.id AND u.role = 'admin'
      WHERE a.cree_par = ?
    `, [req.user.id_specifique_role]);

    return res.status(200).json({ admins });

  } catch (error) {
    console.error('Erreur lors de la récupération des administrateurs:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
