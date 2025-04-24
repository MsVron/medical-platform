const bcrypt = require('bcrypt');
const db = require('../config/db');

exports.addPatient = async (req, res) => {
  try {
    const {
      nom_utilisateur, mot_de_passe, email, prenom, nom, date_naissance, sexe,
      telephone, adresse, ville, code_postal, pays, CNE, groupe_sanguin
    } = req.body;

    if (!nom_utilisateur || !mot_de_passe || !email || !prenom || !nom || !date_naissance || !sexe) {
      return res.status(400).json({ message: "Tous les champs obligatoires doivent être fournis" });
    }

    const [existingUsers] = await db.execute(
      'SELECT id FROM utilisateurs WHERE nom_utilisateur = ? OR email = ?',
      [nom_utilisateur, email]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Nom d'utilisateur ou email déjà utilisé" });
    }

    if (CNE) {
      const [existingCNE] = await db.execute('SELECT id FROM patients WHERE CNE = ?', [CNE]);
      if (existingCNE.length > 0) {
        return res.status(400).json({ message: "CNE déjà utilisé" });
      }
    }

    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    const [patientResult] = await db.execute(
      `INSERT INTO patients (
        prenom, nom, date_naissance, sexe, email, telephone, adresse, ville, code_postal,
        pays, CNE, groupe_sanguin, est_actif
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        prenom, nom, date_naissance, sexe, email || null, telephone || null,
        adresse || null, ville || null, code_postal || null, pays || 'Maroc',
        CNE || null, groupe_sanguin || null, true
      ]
    );

    const patientId = patientResult.insertId;

    await db.execute(
      'INSERT INTO utilisateurs (nom_utilisateur, mot_de_passe, email, role, id_specifique_role, est_actif) VALUES (?, ?, ?, ?, ?, ?)',
      [nom_utilisateur, hashedPassword, email, 'patient', patientId, true]
    );

    return res.status(201).json({ message: "Patient ajouté avec succès" });
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un patient:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.editPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      prenom, nom, date_naissance, sexe, email, est_actif, telephone, adresse,
      ville, code_postal, pays, CNE, groupe_sanguin
    } = req.body;

    if (!prenom || !nom || !date_naissance || !sexe || !email) {
      return res.status(400).json({ message: "Prénom, nom, date de naissance, sexe et email sont obligatoires" });
    }

    const [patients] = await db.execute('SELECT id, CNE FROM patients WHERE id = ?', [id]);
    if (patients.length === 0) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    if (CNE && CNE !== patients[0].CNE) {
      const [existingCNE] = await db.execute('SELECT id FROM patients WHERE CNE = ? AND id != ?', [CNE, id]);
      if (existingCNE.length > 0) {
        return res.status(400).json({ message: "CNE déjà utilisé" });
      }
    }

    await db.execute(
      `UPDATE patients SET
        prenom = ?, nom = ?, date_naissance = ?, sexe = ?, email = ?, telephone = ?,
        adresse = ?, ville = ?, code_postal = ?, pays = ?, CNE = ?, groupe_sanguin = ?,
        est_actif = ?
      WHERE id = ?`,
      [
        prenom, nom, date_naissance, sexe, email, telephone || null,
        adresse || null, ville || null, code_postal || null, pays || 'Maroc',
        CNE || null, groupe_sanguin || null, est_actif !== undefined ? est_actif : true, id
      ]
    );

    await db.execute(
      'UPDATE utilisateurs SET email = ?, est_actif = ? WHERE id_specifique_role = ? AND role = ?',
      [email, est_actif !== undefined ? est_actif : true, id, 'patient']
    );

    return res.status(200).json({ message: "Patient mis à jour avec succès" });
  } catch (error) {
    console.error('Erreur lors de la modification d\'un patient:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const [patients] = await db.execute('SELECT id FROM patients WHERE id = ?', [id]);
    if (patients.length === 0) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    await db.execute('DELETE FROM utilisateurs WHERE id_specifique_role = ? AND role = ?', [id, 'patient']);
    await db.execute('DELETE FROM patients WHERE id = ?', [id]);

    return res.status(200).json({ message: "Patient supprimé avec succès" });
  } catch (error) {
    console.error('Erreur lors de la suppression d\'un patient:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.getPatients = async (req, res) => {
  try {
    if (!req.user || req.user.id_specifique_role === undefined) {
      return res.status(401).json({ message: "Utilisateur non authentifié ou informations insuffisantes" });
    }

    const [patients] = await db.execute(`
      SELECT
        p.id, p.prenom, p.nom, p.date_naissance, p.sexe, p.email, p.telephone,
        p.adresse, p.ville, p.code_postal, p.pays, p.CNE, p.groupe_sanguin, p.est_actif,
        u.nom_utilisateur
      FROM patients p
      JOIN utilisateurs u ON u.id_specifique_role = p.id AND u.role = 'patient'
    `);

    return res.status(200).json({ patients });
  } catch (error) {
    console.error('Erreur lors de la récupération des patients:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};