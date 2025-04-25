const bcrypt = require('bcrypt');
const db = require('../config/db');

exports.addMedecin = async (req, res) => {
  try {
    const {
      nom_utilisateur, mot_de_passe, email, prenom, nom, specialite_id, numero_ordre,
      telephone, email_professionnel, photo_url, biographie, institution_id,
      adresse, ville, code_postal, pays, institution_type, institution_nom
    } = req.body;

    if (!nom_utilisateur || !mot_de_passe || !email || !prenom || !nom || !specialite_id || !numero_ordre) {
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

    const [existingMedecins] = await db.execute(
      'SELECT id FROM medecins WHERE numero_ordre = ?',
      [numero_ordre]
    );
    if (existingMedecins.length > 0) {
      return res.status(400).json({ message: "Numéro d'ordre déjà utilisé" });
    }

    let finalInstitutionId = institution_id;
    if (institution_type === 'cabinet privé' && institution_nom) {
      const [institutionResult] = await db.execute(
        'INSERT INTO institutions (nom, type) VALUES (?, ?)',
        [institution_nom, 'cabinet privé']
      );
      finalInstitutionId = institutionResult.insertId;
    } else if (institution_id) {
      const [institutions] = await db.execute('SELECT id FROM institutions WHERE id = ?', [institution_id]);
      if (institutions.length === 0) {
        return res.status(400).json({ message: "Institution non trouvée" });
      }
    }

    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    const [medecinResult] = await db.execute(
      `INSERT INTO medecins (
        prenom, nom, specialite_id, numero_ordre, telephone, email_professionnel,
        photo_url, biographie, institution_id, est_actif, adresse, ville, code_postal, pays
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        prenom, nom, specialite_id, numero_ordre, telephone || null, email_professionnel || null,
        photo_url || null, biographie || null, finalInstitutionId || null, true,
        adresse || null, ville || null, code_postal || null, pays || 'Maroc'
      ]
    );

    const medecinId = medecinResult.insertId;

    if (institution_type === 'cabinet privé' && institution_nom) {
      const [institutionResult] = await db.execute(
        'INSERT INTO institutions (nom, type, adresse, ville, code_postal, email_contact) VALUES (?, ?, ?, ?, ?, ?)',
        [
          institution_nom,
          'cabinet privé',
          adresse || null,
          ville || null,
          code_postal || null,
          email_professionnel || email || null
        ]
      );
      finalInstitutionId = institutionResult.insertId;
    }

    await db.execute(
      'INSERT INTO utilisateurs (nom_utilisateur, mot_de_passe, email, role, id_specifique_role, est_actif) VALUES (?, ?, ?, ?, ?, ?)',
      [nom_utilisateur, hashedPassword, email, 'medecin', medecinId, true]
    );

    await db.execute(
      'UPDATE specialites SET usage_count = usage_count + 1 WHERE id = ?',
      [specialite_id]
    );

    return res.status(201).json({ message: "Médecin ajouté avec succès" });
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un médecin:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.editMedecin = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      prenom, nom, specialite_id, numero_ordre, telephone, email_professionnel,
      photo_url, biographie, institution_id, email, est_actif, adresse, ville,
      code_postal, pays, institution_type, institution_nom
    } = req.body;

    if (!prenom || !nom || !specialite_id || !numero_ordre || !email) {
      return res.status(400).json({ message: "Prénom, nom, spécialité, numéro d'ordre et email sont obligatoires" });
    }

    const [medecins] = await db.execute('SELECT id, numero_ordre, specialite_id, institution_id FROM medecins WHERE id = ?', [id]);
    if (medecins.length === 0) {
      return res.status(404).json({ message: "Médecin non trouvé" });
    }

    if (medecins[0].numero_ordre !== numero_ordre) {
      const [existingMedecins] = await db.execute(
        'SELECT id FROM medecins WHERE numero_ordre = ? AND id != ?',
        [numero_ordre, id]
      );
      if (existingMedecins.length > 0) {
        return res.status(400).json({ message: "Numéro d'ordre déjà utilisé" });
      }
    }

    let finalInstitutionId = institution_id;
    if (institution_type === 'cabinet privé' && institution_nom) {
      const [existingCabinet] = await db.execute(
        'SELECT id FROM institutions WHERE medecin_proprietaire_id = ? AND type = ?',
        [id, 'cabinet privé']
      );
      if (existingCabinet.length > 0) {
        await db.execute(
          'UPDATE institutions SET nom = ?, adresse = ?, ville = ?, code_postal = ?, email_contact = ? WHERE id = ?',
          [
            institution_nom,
            adresse || null,
            ville || null,
            code_postal || null,
            email_professionnel || email || null,
            existingCabinet[0].id
          ]
        );
        finalInstitutionId = existingCabinet[0].id;
      } else {
        const [institutionResult] = await db.execute(
          'INSERT INTO institutions (nom, type, medecin_proprietaire_id, adresse, ville, code_postal, email_contact) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            institution_nom,
            'cabinet privé',
            id,
            adresse || null,
            ville || null,
            code_postal || null,
            email_professionnel || email || null
          ]
        );
        finalInstitutionId = institutionResult.insertId;
      }
    } else if (institution_id) {
      const [institutions] = await db.execute('SELECT id FROM institutions WHERE id = ?', [institution_id]);
      if (institutions.length === 0) {
        return res.status(400).json({ message: "Institution non trouvée" });
      }
    }

    if (medecins[0].specialite_id !== specialite_id) {
      await db.execute(
        'UPDATE specialites SET usage_count = usage_count - 1 WHERE id = ? AND usage_count > 0',
        [medecins[0].specialite_id]
      );
      await db.execute(
        'UPDATE specialites SET usage_count = usage_count + 1 WHERE id = ?',
        [specialite_id]
      );
    }

    await db.execute(
      `UPDATE medecins SET
        prenom = ?, nom = ?, specialite_id = ?, numero_ordre = ?, telephone = ?,
        email_professionnel = ?, photo_url = ?, biographie = ?, institution_id = ?,
        est_actif = ?, adresse = ?, ville = ?, code_postal = ?, pays = ?
      WHERE id = ?`,
      [
        prenom, nom, specialite_id, numero_ordre, telephone || null,
        email_professionnel || null, photo_url || null, biographie || null, finalInstitutionId || null,
        est_actif !== undefined ? est_actif : true, adresse || null, ville || null,
        code_postal || null, pays || 'Maroc', id
      ]
    );

    await db.execute(
      'UPDATE utilisateurs SET email = ?, est_actif = ? WHERE id_specifique_role = ? AND role = ?',
      [email, est_actif !== undefined ? est_actif : true, id, 'medecin']
    );

    return res.status(200).json({ message: "Médecin mis à jour avec succès" });
  } catch (error) {
    console.error('Erreur lors de la modification d\'un médecin:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.deleteMedecin = async (req, res) => {
  try {
    const { id } = req.params;

    const [medecins] = await db.execute('SELECT id, specialite_id, institution_id FROM medecins WHERE id = ?', [id]);
    if (medecins.length === 0) {
      return res.status(404).json({ message: "Médecin non trouvé" });
    }

    await db.execute(
      'UPDATE specialites SET usage_count = usage_count - 1 WHERE id = ? AND usage_count > 0',
      [medecins[0].specialite_id]
    );

    if (medecins[0].institution_id) {
      await db.execute(
        'DELETE FROM institutions WHERE id = ? AND type = ? AND medecin_proprietaire_id = ?',
        [medecins[0].institution_id, 'cabinet privé', id]
      );
    }

    await db.execute('DELETE FROM utilisateurs WHERE id_specifique_role = ? AND role = ?', [id, 'medecin']);
    await db.execute('DELETE FROM medecins WHERE id = ?', [id]);

    return res.status(200).json({ message: "Médecin supprimé avec succès" });
  } catch (error) {
    console.error('Erreur lors de la suppression d\'un médecin:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.getMedecins = async (req, res) => {
  try {
    if (!req.user || req.user.id_specifique_role === undefined) {
      return res.status(401).json({ message: "Utilisateur non authentifié ou informations insuffisantes" });
    }

    const includeInactive = req.query.includeInactive === 'true';
    const query = `
      SELECT
        m.id, m.prenom, m.nom, m.specialite_id, s.nom AS specialite_nom,
        m.numero_ordre, m.telephone, m.email_professionnel, m.photo_url,
        m.biographie, m.institution_id, i.nom AS institution_nom, i.type AS institution_type,
        m.est_actif, m.adresse, m.ville, m.code_postal, m.pays, u.email, u.nom_utilisateur
      FROM medecins m
      JOIN utilisateurs u ON u.id_specifique_role = m.id AND u.role = 'medecin'
      LEFT JOIN specialites s ON m.specialite_id = s.id
      LEFT JOIN institutions i ON m.institution_id = i.id
      ${includeInactive ? '' : 'WHERE m.est_actif = true'}
    `;

    const [medecins] = await db.execute(query);
    return res.status(200).json({ medecins });
  } catch (error) {
    console.error('Erreur lors de la récupération des médecins:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.getSpecialites = async (req, res) => {
  try {
    const relevanceOrder = [
      'Médecine générale', 'Cardiologie', 'Pédiatrie', 'Gynécologie-Obstétrique',
      'Dermatologie', 'Ophtalmologie', 'Orthopédie', 'Neurologie', 'Psychiatrie',
      'Radiologie', 'Pneumologie', 'Gastro-entérologie', 'Endocrinologie'
    ];

    const [specialites] = await db.execute(`
      SELECT id, nom, usage_count
      FROM specialites
      ORDER BY
        FIELD(nom, ${relevanceOrder.map(() => '?').join(',')}) DESC,
        usage_count DESC,
        nom ASC
    `, relevanceOrder);

    return res.status(200).json({ specialites });
  } catch (error) {
    console.error('Erreur lors de la récupération des spécialités:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.getInstitutions = async (req, res) => {
  try {
    const [institutions] = await db.execute(`
      SELECT id, nom, type, medecin_proprietaire_id
      FROM institutions
      ORDER BY nom
    `);
    return res.status(200).json({ institutions });
  } catch (error) {
    console.error('Erreur lors de la récupération des institutions:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// a dedicated endpoint for the current doctor
exports.getCurrentMedecin = async (req, res) => {
  try {
    const [medecins] = await db.execute(
      `SELECT
        m.id, m.prenom, m.nom, m.specialite_id, s.nom AS specialite_nom,
        m.institution_id, i.nom AS institution_nom
      FROM medecins m
      LEFT JOIN specialites s ON m.specialite_id = s.id
      LEFT JOIN institutions i ON m.institution_id = i.id
      WHERE m.id = ? AND m.est_actif = true`,
      [req.user.id_specifique_role]
    );
    if (medecins.length === 0) {
      return res.status(404).json({ message: "Médecin non trouvé" });
    }
    return res.status(200).json({ medecin: medecins[0] });
  } catch (error) {
    console.error('Erreur lors de la récupération du médecin:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// In medecinController.js (append to existing file)

// Get institutions where the doctor works
exports.getDoctorInstitutions = async (req, res) => {
  try {
    const medecinId = req.user.id_specifique_role;
    const [institutions] = await db.execute(
      `SELECT DISTINCT i.id, i.nom, i.type
       FROM institutions i
       LEFT JOIN medecin_institution mi ON i.id = mi.institution_id AND mi.medecin_id = ?
       WHERE mi.medecin_id = ? OR i.id = (SELECT institution_id FROM medecins WHERE id = ?)`,
      [medecinId, medecinId, medecinId]
    );
    return res.status(200).json({ institutions });
  } catch (error) {
    console.error('Erreur lors de la récupération des institutions du médecin:', error);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Get weekly availabilities for the doctor
exports.getAvailabilities = async (req, res) => {
  try {
    const medecinId = req.user.id_specifique_role;
    const [availabilities] = await db.execute(
      `SELECT dm.id, dm.medecin_id, dm.institution_id, i.nom AS institution_nom,
              dm.jour_semaine, dm.heure_debut, dm.heure_fin, dm.intervalle_minutes, dm.est_actif
       FROM disponibilites_medecin dm
       JOIN institutions i ON dm.institution_id = i.id
       WHERE dm.medecin_id = ?`,
      [medecinId]
    );
    return res.status(200).json({ availabilities });
  } catch (error) {
    console.error('Erreur lors de la récupération des disponibilités:', error);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Add a weekly availability

exports.addAvailability = async (req, res) => {
  try {
    const medecinId = req.user.id_specifique_role;
    const {
      institution_id, jours_semaine, heure_debut, heure_fin, intervalle_minutes, est_actif
    } = req.body;

    if (!institution_id || !jours_semaine || !jours_semaine.length || !heure_debut || !heure_fin) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être fournis' });
    }

    // Verify doctor is affiliated with the institution
    const [affiliations] = await db.execute(
      `SELECT 1 FROM medecin_institution WHERE medecin_id = ? AND institution_id = ?
       UNION
       SELECT 1 FROM medecins WHERE id = ? AND institution_id = ?`,
      [medecinId, institution_id, medecinId, institution_id]
    );
    if (affiliations.length === 0) {
      return res.status(403).json({ message: 'Vous n’êtes pas affilié à cette institution' });
    }

    // Validate time range
    if (heure_debut >= heure_fin) {
      return res.status(400).json({ message: 'L’heure de début doit être inférieure à l’heure de fin' });
    }

    // Insert availability for each selected day
    const insertedIds = [];
    for (const jour of jours_semaine) {
      const [result] = await db.execute(
        `INSERT INTO disponibilites_medecin (
          medecin_id, institution_id, jour_semaine, heure_debut, heure_fin, intervalle_minutes, est_actif
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          medecinId,
          institution_id,
          jour,
          heure_debut,
          heure_fin,
          intervalle_minutes || 30,
          est_actif !== undefined ? est_actif : true
        ]
      );
      insertedIds.push(result.insertId);
    }

    return res.status(201).json({ message: 'Disponibilités ajoutées avec succès', ids: insertedIds });
  } catch (error) {
    console.error('Erreur lors de l’ajout des disponibilités:', error);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Update a weekly availability
exports.updateAvailability = async (req, res) => {
  try {
    const medecinId = req.user.id_specifique_role;
    const { id } = req.params;
    const {
      institution_id, jour_semaine, heure_debut, heure_fin, intervalle_minutes, est_actif
    } = req.body;

    if (!institution_id || !jour_semaine || !heure_debut || !heure_fin) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être fournis' });
    }

    // Verify availability belongs to the doctor
    const [availabilities] = await db.execute(
      'SELECT id FROM disponibilites_medecin WHERE id = ? AND medecin_id = ?',
      [id, medecinId]
    );
    if (availabilities.length === 0) {
      return res.status(404).json({ message: 'Disponibilité non trouvée ou non autorisée' });
    }

    // Verify doctor is affiliated with the institution
    const [affiliations] = await db.execute(
      `SELECT 1 FROM medecin_institution WHERE medecin_id = ? AND institution_id = ?
       UNION
       SELECT 1 FROM medecins WHERE id = ? AND institution_id = ?`,
      [medecinId, institution_id, medecinId, institution_id]
    );
    if (affiliations.length === 0) {
      return res.status(403).json({ message: 'Vous n’êtes pas affilié à cette institution' });
    }

    // Validate time range
    if (heure_debut >= heure_fin) {
      return res.status(400).json({ message: 'L’heure de début doit être inférieure à l’heure de fin' });
    }

    await db.execute(
      `UPDATE disponibilites_medecin SET
        institution_id = ?, jour_semaine = ?, heure_debut = ?, heure_fin = ?,
        intervalle_minutes = ?, est_actif = ?
       WHERE id = ? AND medecin_id = ?`,
      [
        institution_id,
        jour_semaine,
        heure_debut,
        heure_fin,
        intervalle_minutes || 30,
        est_actif !== undefined ? est_actif : true,
        id,
        medecinId
      ]
    );

    return res.status(200).json({ message: 'Disponibilité mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la disponibilité:', error);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Delete a weekly availability
exports.deleteAvailability = async (req, res) => {
  try {
    const medecinId = req.user.id_specifique_role;
    const { id } = req.params;

    const [availabilities] = await db.execute(
      'SELECT id FROM disponibilites_medecin WHERE id = ? AND medecin_id = ?',
      [id, medecinId]
    );
    if (availabilities.length === 0) {
      return res.status(404).json({ message: 'Disponibilité non trouvée ou non autorisée' });
    }

    await db.execute('DELETE FROM disponibilites_medecin WHERE id = ? AND medecin_id = ?', [id, medecinId]);
    return res.status(200).json({ message: 'Disponibilité supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la disponibilité:', error);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Get emergency absences for the doctor
exports.getEmergencyAbsences = async (req, res) => {
  try {
    const medecinId = req.user.id_specifique_role;
    const [absences] = await db.execute(
      `SELECT id, medecin_id, date_debut, date_fin, motif
       FROM indisponibilites_exceptionnelles
       WHERE medecin_id = ? AND date_debut >= CURDATE()`,
      [medecinId]
    );
    return res.status(200).json({ absences });
  } catch (error) {
    console.error('Erreur lors de la récupération des absences:', error);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Add an emergency absence
exports.addEmergencyAbsence = async (req, res) => {
  try {
    const medecinId = req.user.id_specifique_role;
    const { date_debut, date_fin, motif } = req.body;

    if (!date_debut || !date_fin) {
      return res.status(400).json({ message: 'Les dates de début et de fin sont obligatoires' });
    }

    if (new Date(date_debut) >= new Date(date_fin)) {
      return res.status(400).json({ message: 'La date de début doit être inférieure à la date de fin' });
    }

    const [result] = await db.execute(
      `INSERT INTO indisponibilites_exceptionnelles (medecin_id, date_debut, date_fin, motif)
       VALUES (?, ?, ?, ?)`,
      [medecinId, date_debut, date_fin, motif || null]
    );

    return res.status(201).json({ message: 'Absence ajoutée avec succès', id: result.insertId });
  } catch (error) {
    console.error('Erreur lors de l’ajout de l’absence:', error);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Delete an emergency absence
exports.deleteEmergencyAbsence = async (req, res) => {
  try {
    const medecinId = req.user.id_specifique_role;
    const { id } = req.params;

    const [absences] = await db.execute(
      'SELECT id FROM indisponibilites_exceptionnelles WHERE id = ? AND medecin_id = ?',
      [id, medecinId]
    );
    if (absences.length === 0) {
      return res.status(404).json({ message: 'Absence non trouvée ou non autorisée' });
    }

    await db.execute('DELETE FROM indisponibilites_exceptionnelles WHERE id = ? AND medecin_id = ?', [id, medecinId]);
    return res.status(200).json({ message: 'Absence supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l’absence:', error);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};