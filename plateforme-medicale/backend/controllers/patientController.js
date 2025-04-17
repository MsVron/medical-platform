const db = require('../config/db');

exports.getPatients = async (req, res) => {
  try {
    let query = `
      SELECT p.id, p.prenom, p.nom, p.date_naissance, p.sexe, p.email, p.telephone
      FROM patients p
    `;
    let params = [];

    // Restrict doctors to their patients
    if (req.user.role === 'medecin') {
      query += ' WHERE p.medecin_traitant_id = ?';
      params.push(req.user.id_specifique_role);
    }

    // Restrict institutions to their patients (assuming a patient-institution relationship)
    if (req.user.role === 'institution') {
      query += `
        JOIN medecin_institution mi ON p.medecin_traitant_id = mi.medecin_id
        WHERE mi.institution_id = ?
      `;
      params.push(req.user.id_specifique_role);
    }

    const [patients] = await db.execute(query, params);
    return res.status(200).json({ patients });
  } catch (error) {
    console.error('Erreur lors de la récupération des patients:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.addPatient = async (req, res) => {
  try {
    // Only super_admin can add patients
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: "Accès réservé aux super administrateurs" });
    }

    const { prenom, nom, date_naissance, sexe, email, telephone, medecin_traitant_id } = req.body;

    if (!prenom || !nom || !date_naissance || !sexe) {
      return res.status(400).json({ message: "Tous les champs obligatoires doivent être fournis" });
    }

    const [result] = await db.execute(
      'INSERT INTO patients (prenom, nom, date_naissance, sexe, email, telephone, medecin_traitant_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [prenom, nom, date_naissance, sexe, email || null, telephone || null, medecin_traitant_id || null]
    );

    return res.status(201).json({ message: "Patient ajouté avec succès", patientId: result.insertId });
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un patient:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.editPatient = async (req, res) => {
  try {
    // Only super_admin can edit patients
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: "Accès réservé aux super administrateurs" });
    }

    const { id } = req.params;
    const { prenom, nom, date_naissance, sexe, email, telephone, medecin_traitant_id } = req.body;

    if (!prenom || !nom || !date_naissance || !sexe) {
      return res.status(400).json({ message: "Tous les champs obligatoires doivent être fournis" });
    }

    const [result] = await db.execute(
      'UPDATE patients SET prenom = ?, nom = ?, date_naissance = ?, sexe = ?, email = ?, telephone = ?, medecin_traitant_id = ? WHERE id = ?',
      [prenom, nom, date_naissance, sexe, email || null, telephone || null, medecin_traitant_id || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    return res.status(200).json({ message: "Patient mis à jour avec succès" });
  } catch (error) {
    console.error('Erreur lors de la modification d\'un patient:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    // Only super_admin can delete patients
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: "Accès réservé aux super administrateurs" });
    }

    const { id } = req.params;

    const [result] = await db.execute('DELETE FROM patients WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    return res.status(200).json({ message: "Patient supprimé avec succès" });
  } catch (error) {
    console.error('Erreur lors de la suppression d\'un patient:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};