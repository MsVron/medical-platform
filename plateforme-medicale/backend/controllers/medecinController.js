const db = require('../config/db');

exports.getMedecins = async (req, res) => {
  try {
    let query = `
      SELECT m.id, m.prenom, m.nom, m.numero_ordre, m.email_professionnel, m.telephone, s.nom AS specialite, i.nom AS institution
      FROM medecins m
      LEFT JOIN specialites s ON m.specialite_id = s.id
      LEFT JOIN institutions i ON m.institution_id = i.id
    `;
    let params = [];

    // Restrict to institution's doctors
    if (req.user.role === 'institution') {
      query += ' WHERE m.institution_id = ?';
      params.push(req.user.id_specifique_role);
    }

    const [medecins] = await db.execute(query, params);
    return res.status(200).json({ medecins });
  } catch (error) {
    console.error('Erreur lors de la récupération des médecins:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.addMedecin = async (req, res) => {
  try {
    const { prenom, nom, numero_ordre, specialite_id, email_professionnel, telephone, institution_id } = req.body;

    if (!prenom || !nom || !numero_ordre) {
      return res.status(400).json({ message: "Prénom, nom et numéro d'ordre sont obligatoires" });
    }

    // Admins cannot set critical fields
    if (req.user.role === 'admin' && (numero_ordre || specialite_id)) {
      return res.status(403).json({ message: "Les administrateurs ne peuvent pas définir les champs critiques" });
    }

    const [result] = await db.execute(
      'INSERT INTO medecins (prenom, nom, numero_ordre, specialite_id, email_professionnel, telephone, institution_id, est_actif) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [prenom, nom, numero_ordre, specialite_id || null, email_professionnel || null, telephone || null, institution_id || null, true]
    );

    return res.status(201).json({ message: "Médecin ajouté avec succès", medecinId: result.insertId });
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un médecin:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.editMedecin = async (req, res) => {
  try {
    const { id } = req.params;
    const { prenom, nom, numero_ordre, specialite_id, email_professionnel, telephone, institution_id, est_actif } = req.body;

    if (!prenom || !nom) {
      return res.status(400).json({ message: "Prénom et nom sont obligatoires" });
    }

    // Admins cannot modify critical fields
    if (req.user.role === 'admin' && (numero_ordre || specialite_id)) {
      return res.status(403).json({ message: "Les administrateurs ne peuvent pas modifier les champs critiques" });
    }

    const [result] = await db.execute(
      'UPDATE medecins SET prenom = ?, nom = ?, numero_ordre = ?, specialite_id = ?, email_professionnel = ?, telephone = ?, institution_id = ?, est_actif = ? WHERE id = ?',
      [
        prenom,
        nom,
        req.user.role === 'super_admin' ? numero_ordre : undefined,
        req.user.role === 'super_admin' ? specialite_id : undefined,
        email_professionnel || null,
        telephone || null,
        institution_id || null,
        est_actif !== undefined ? est_actif : true,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Médecin non trouvé" });
    }

    return res.status(200).json({ message: "Médecin mis à jour avec succès" });
  } catch (error) {
    console.error('Erreur lors de la modification d\'un médecin:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.deleteMedecin = async (req, res) => {
  try {
    // Only super_admin can delete
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: "Accès réservé aux super administrateurs" });
    }

    const { id } = req.params;

    const [result] = await db.execute('DELETE FROM medecins WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Médecin non trouvé" });
    }

    return res.status(200).json({ message: "Médecin supprimé avec succès" });
  } catch (error) {
    console.error('Erreur lors de la suppression d\'un médecin:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

module.exports = exports;