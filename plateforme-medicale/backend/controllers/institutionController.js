const db = require('../config/db');

exports.getInstitutions = async (req, res) => {
  try {
    const [institutions] = await db.execute(`
      SELECT id, nom, adresse, ville, code_postal, telephone, email_contact
      FROM institutions
      WHERE est_actif = true
    `);
    return res.status(200).json({ institutions });
  } catch (error) {
    console.error('Erreur lors de la récupération des institutions:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.addInstitution = async (req, res) => {
  try {
    const { nom, adresse, ville, code_postal, telephone, email_contact } = req.body;

    if (!nom || !adresse || !ville || !code_postal) {
      return res.status(400).json({ message: "Nom, adresse, ville et code postal sont obligatoires" });
    }

    const [result] = await db.execute(
      'INSERT INTO institutions (nom, adresse, ville, code_postal, telephone, email_contact, est_actif) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nom, adresse, ville, code_postal, telephone || null, email_contact || null, true]
    );

    return res.status(201).json({ message: "Institution ajoutée avec succès", institutionId: result.insertId });
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'une institution:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.editInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, adresse, ville, code_postal, telephone, email_contact, est_actif } = req.body;

    if (!adresse || !ville || !code_postal) {
      return res.status(400).json({ message: "Adresse, ville et code postal sont obligatoires" });
    }

    // Admins cannot modify critical fields
    if (req.user.role === 'admin' && nom) {
      return res.status(403).json({ message: "Les administrateurs ne peuvent pas modifier le nom" });
    }

    const [result] = await db.execute(
      'UPDATE institutions SET nom = ?, adresse = ?, ville = ?, code_postal = ?, telephone = ?, email_contact = ?, est_actif = ? WHERE id = ?',
      [
        req.user.role === 'super_admin' ? nom : undefined,
        adresse,
        ville,
        code_postal,
        telephone || null,
        email_contact || null,
        est_actif !== undefined ? est_actif : true,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Institution non trouvée" });
    }

    return res.status(200).json({ message: "Institution mise à jour avec succès" });
  } catch (error) {
    console.error('Erreur lors de la modification d\'une institution:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.deleteInstitution = async (req, res) => {
  try {
    // Only super_admin can delete
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: "Accès réservé aux super administrateurs" });
    }

    const { id } = req.params;

    const [result] = await db.execute('DELETE FROM institutions WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Institution non trouvée" });
    }

    return res.status(200).json({ message: "Institution supprimée avec succès" });
  } catch (error) {
    console.error('Erreur lors de la suppression d\'une institution:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

module.exports = exports;