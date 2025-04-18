const bcrypt = require('bcrypt');
const db = require('../config/db');

exports.addAdmin = async (req, res) => {
  try {
    const { nom_utilisateur, mot_de_passe, email, prenom, nom, telephone } = req.body;

    if (!nom_utilisateur || !mot_de_passe || !email || !prenom || !nom) {
      return res.status(400).json({ message: "Tous les champs obligatoires doivent être fournis" });
    }

    if (!req.user || req.user.id_specifique_role === undefined) {
      return res.status(401).json({ message: "Utilisateur non authentifié ou informations insuffisantes" });
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
      'INSERT INTO admins (prenom, nom, telephone, cree_par) VALUES (?, ?, ?, ?)',
      [prenom, nom, telephone || null, req.user.id_specifique_role]
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

exports.editAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { prenom, nom, telephone, email, est_actif } = req.body;

    if (!prenom || !nom || !email) {
      return res.status(400).json({ message: "Prénom, nom et email sont obligatoires" });
    }

    const [admins] = await db.execute('SELECT id FROM admins WHERE id = ?', [id]);
    if (admins.length === 0) {
      return res.status(404).json({ message: "Administrateur non trouvé" });
    }

    await db.execute(
      'UPDATE admins SET prenom = ?, nom = ?, telephone = ? WHERE id = ?',
      [prenom, nom, telephone || null, id]
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

exports.getAdmins = async (req, res) => {
  try {
    if (!req.user || req.user.id_specifique_role === undefined) {
      return res.status(401).json({ message: "Utilisateur non authentifié ou informations insuffisantes" });
    }

    const [admins] = await db.execute(`
      SELECT a.id, a.prenom, a.nom, a.telephone, a.date_creation, u.email, u.est_actif
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