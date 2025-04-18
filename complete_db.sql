-- Table d'authentification commune
CREATE TABLE utilisateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom_utilisateur VARCHAR(50) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  role ENUM('super_admin', 'admin', 'medecin', 'patient', 'institution') NOT NULL,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_specifique_role INT NOT NULL, -- Lien vers table spécifique au rôle
  est_actif BOOLEAN DEFAULT TRUE,
  derniere_connexion DATETIME,
  token_reset_password VARCHAR(255),
  date_expiration_token DATETIME
);

-- Table des super administrateurs (gèrent les autres admins)
CREATE TABLE super_admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prenom VARCHAR(50) NOT NULL,
  nom VARCHAR(50) NOT NULL,
  telephone VARCHAR(20),
  adresse VARCHAR(255)
);

-- Table des administrateurs (gérés par super admin)
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prenom VARCHAR(50) NOT NULL,
  nom VARCHAR(50) NOT NULL,
  telephone VARCHAR(20),
  cree_par INT, -- Référence super_admins.id
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cree_par) REFERENCES super_admins(id),
);

-- Table des établissements
CREATE TABLE institutions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  adresse VARCHAR(255) NOT NULL,
  ville VARCHAR(100) NOT NULL,
  code_postal VARCHAR(10) NOT NULL,
  pays VARCHAR(50) NOT NULL DEFAULT 'France',
  telephone VARCHAR(20),
  email_contact VARCHAR(100) NOT NULL,
  site_web VARCHAR(255),
  description TEXT,
  horaires_ouverture TEXT,
  coordonnees_gps VARCHAR(50),
  est_actif BOOLEAN DEFAULT TRUE,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---

-- Table des spécialités médicales
CREATE TABLE specialites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

-- Table des médecins
CREATE TABLE medecins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prenom VARCHAR(50) NOT NULL,
  nom VARCHAR(50) NOT NULL,
  specialite_id INT,
  numero_ordre VARCHAR(50) UNIQUE NOT NULL,
  telephone VARCHAR(20),
  email_professionnel VARCHAR(100),
  photo_url VARCHAR(255),
  biographie TEXT,
  institution_id INT, -- Établissement principal
  est_actif BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (specialite_id) REFERENCES specialites(id),
  FOREIGN KEY (institution_id) REFERENCES institutions(id)
);

---

-- Table des affiliations médecins-institutions (pour médecins travaillant dans plusieurs établissements)
CREATE TABLE medecin_institution (
  medecin_id INT,
  institution_id INT,
  est_principal BOOLEAN DEFAULT FALSE,
  date_debut DATE NOT NULL,
  date_fin DATE,
  PRIMARY KEY (medecin_id, institution_id),
  FOREIGN KEY (medecin_id) REFERENCES medecins(id),
  FOREIGN KEY (institution_id) REFERENCES institutions(id)
);

-- Table des disponibilités des médecins
CREATE TABLE disponibilites_medecin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  medecin_id INT NOT NULL,
  institution_id INT NOT NULL, -- Dans quel établissement
  jour_semaine ENUM('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche') NOT NULL,
  heure_debut TIME NOT NULL,
  heure_fin TIME NOT NULL,
  intervalle_minutes INT DEFAULT 30, -- Durée de chaque créneau en minutes
  est_actif BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (medecin_id) REFERENCES medecins(id),
  FOREIGN KEY (institution_id) REFERENCES institutions(id)
);

-- Table des jours d'indisponibilité exceptionnelle
CREATE TABLE indisponibilites_exceptionnelles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  medecin_id INT NOT NULL,
  date_debut DATETIME NOT NULL,
  date_fin DATETIME NOT NULL,
  motif VARCHAR(255),
  FOREIGN KEY (medecin_id) REFERENCES medecins(id)
);

---

-- Table des patients avec informations complètes
CREATE TABLE patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prenom VARCHAR(50) NOT NULL,
  nom VARCHAR(50) NOT NULL,
  date_naissance DATE NOT NULL,
  sexe ENUM('M', 'F', 'Autre') NOT NULL,
  CNE VARCHAR(20) UNIQUE,
  adresse VARCHAR(255),
  ville VARCHAR(100),
  code_postal VARCHAR(10),
  pays VARCHAR(50) DEFAULT 'France',
  telephone VARCHAR(20),
  email VARCHAR(100),
  contact_urgence_nom VARCHAR(100),
  contact_urgence_telephone VARCHAR(20),
  groupe_sanguin ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
  taille_cm INT,
  poids_kg DECIMAL(5,2),
  est_fumeur BOOLEAN,
  consommation_alcool ENUM('non', 'occasionnel', 'régulier', 'quotidien'),
  activite_physique ENUM('sédentaire', 'légère', 'modérée', 'intense'),
  profession VARCHAR(100),
  medecin_traitant_id INT,
  date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (medecin_traitant_id) REFERENCES medecins(id)
);
---
-- Table des allergies (référentiel)
CREATE TABLE allergies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

-- Table de liaison patient-allergies
CREATE TABLE patient_allergies (
  patient_id INT NOT NULL,
  allergie_id INT NOT NULL,
  date_diagnostic DATE,
  severite ENUM('légère', 'modérée', 'sévère', 'mortelle') NOT NULL,
  notes TEXT,
  PRIMARY KEY (patient_id, allergie_id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (allergie_id) REFERENCES allergies(id)
);

-- Table des antécédents médicaux
CREATE TABLE antecedents_medicaux (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  type ENUM('medical', 'chirurgical', 'familial') NOT NULL,
  description TEXT NOT NULL,
  date_debut DATE,
  date_fin DATE,
  est_chronique BOOLEAN DEFAULT FALSE,
  medecin_id INT, -- Médecin ayant enregistré l'antécédent
  date_enregistrement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (medecin_id) REFERENCES medecins(id)
);
---

-- Table des médicaments (référentiel)
CREATE TABLE medicaments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom_commercial VARCHAR(100) NOT NULL,
  nom_molecule VARCHAR(100) NOT NULL,
  dosage VARCHAR(50),
  forme ENUM('comprimé', 'gélule', 'sirop', 'injectable', 'patch', 'pommade', 'autre') NOT NULL,
  description TEXT
);

-- Table des traitements en cours
CREATE TABLE traitements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  medicament_id INT NOT NULL,
  posologie VARCHAR(255) NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE,
  est_permanent BOOLEAN DEFAULT FALSE,
  medecin_prescripteur_id INT NOT NULL,
  date_prescription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  instructions TEXT,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (medicament_id) REFERENCES medicaments(id),
  FOREIGN KEY (medecin_prescripteur_id) REFERENCES medecins(id)
);
---
-- Table des rendez-vous
CREATE TABLE rendez_vous (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  medecin_id INT NOT NULL,
  institution_id INT NOT NULL,
  date_heure_debut DATETIME NOT NULL,
  date_heure_fin DATETIME NOT NULL,
  motif VARCHAR(255) NOT NULL,
  statut ENUM('planifié', 'confirmé', 'en cours', 'terminé', 'annulé', 'patient absent') DEFAULT 'planifié',
  notes_patient TEXT, -- Notes fournies par le patient lors de la prise de RDV
  mode ENUM('présentiel', 'téléconsultation') DEFAULT 'présentiel',
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createur_id INT NOT NULL, -- ID de l'utilisateur qui a créé le RDV (peut être patient, médecin, assistant)
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (medecin_id) REFERENCES medecins(id),
  FOREIGN KEY (institution_id) REFERENCES institutions(id),
  FOREIGN KEY (createur_id) REFERENCES utilisateurs(id)
);

-- Table des notifications
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  titre VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('rdv', 'annulation', 'rappel', 'résultat', 'système') NOT NULL,
  est_lue BOOLEAN DEFAULT FALSE,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_lecture DATETIME,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
);

---

-- Table des consultations (compte-rendus)
CREATE TABLE consultations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rendez_vous_id INT NOT NULL,
  medecin_id INT NOT NULL,
  patient_id INT NOT NULL,
  date_consultation DATETIME NOT NULL,
  motif TEXT NOT NULL,
  anamnese TEXT,
  examen_clinique TEXT,
  diagnostic TEXT,
  conclusion TEXT,
  est_complete BOOLEAN DEFAULT FALSE,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_modification DATETIME,
  FOREIGN KEY (rendez_vous_id) REFERENCES rendez_vous(id),
  FOREIGN KEY (medecin_id) REFERENCES medecins(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Table des constantes vitales
CREATE TABLE constantes_vitales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  consultation_id INT NOT NULL,
  patient_id INT NOT NULL,
  date_mesure DATETIME NOT NULL,
  temperature DECIMAL(3,1),
  tension_arterielle_systolique INT,
  tension_arterielle_diastolique INT,
  frequence_cardiaque INT,
  saturation_oxygene INT,
  frequence_respiratoire INT,
  glycemie DECIMAL(5,2),
  notes TEXT,
  FOREIGN KEY (consultation_id) REFERENCES consultations(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Table des analyses médicales (types)
CREATE TABLE types_analyses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  valeurs_normales TEXT
);
---
-- Table des résultats d'analyses
CREATE TABLE resultats_analyses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  type_analyse_id INT NOT NULL,
  medecin_prescripteur_id INT NOT NULL,
  date_prescription DATE NOT NULL,
  date_realisation DATE,
  laboratoire VARCHAR(100),
  resultats TEXT,
  interpretation TEXT,
  est_normal BOOLEAN,
  document_url VARCHAR(255), -- Lien vers le PDF ou l'image du résultat
  medecin_interpreteur_id INT,
  date_interpretation DATETIME,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (type_analyse_id) REFERENCES types_analyses(id),
  FOREIGN KEY (medecin_prescripteur_id) REFERENCES medecins(id),
  FOREIGN KEY (medecin_interpreteur_id) REFERENCES medecins(id)
);

-- Table des examens d'imagerie (types)
CREATE TABLE types_imagerie (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

---

-- Table des résultats d'imagerie
CREATE TABLE resultats_imagerie (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  type_imagerie_id INT NOT NULL,
  medecin_prescripteur_id INT NOT NULL,
  date_prescription DATE NOT NULL,
  date_realisation DATE,
  institution_realisation_id INT,
  interpretation TEXT,
  conclusion TEXT,
  image_urls TEXT, -- Stocke les liens vers les images (séparés par des virgules)
  medecin_radiologue_id INT,
  date_interpretation DATETIME,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (type_imagerie_id) REFERENCES types_imagerie(id),
  FOREIGN KEY (medecin_prescripteur_id) REFERENCES medecins(id),
  FOREIGN KEY (institution_realisation_id) REFERENCES institutions(id),
  FOREIGN KEY (medecin_radiologue_id) REFERENCES medecins(id)
);

-- Table des documents médicaux
CREATE TABLE documents_medicaux (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  type ENUM('ordonnance', 'certificat', 'compte-rendu', 'lettre', 'autre') NOT NULL,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  document_url VARCHAR(255) NOT NULL,
  medecin_id INT NOT NULL,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  est_partage BOOLEAN DEFAULT FALSE, -- Si le document est partagé avec le patient
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (medecin_id) REFERENCES medecins(id)
);

---

-- Table de l'historique des actions
CREATE TABLE historique_actions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  table_concernee VARCHAR(50) NOT NULL,
  enregistrement_id INT NOT NULL,
  description TEXT,
  date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  adresse_ip VARCHAR(45),
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
);

INSERT INTO super_admins (prenom, nom, telephone, adresse)
VALUES ('Aya', 'Beroukech', '+212 614-026389', 'SupMTI Oujda');

-- Insert corresponding user for authentication
INSERT INTO utilisateurs (nom_utilisateur, mot_de_passe, email, role, id_specifique_role)
VALUES (
  'ayaberroukech',
  '$2b$10$8Rg2IbdfEkvQ3AgfsVpZkOQbK16TDoWdmJ78baLcmHVvGIK2XMD6K', -- Password: admin
  'aya.beroukech@medical.com',
  'super_admin',
  (SELECT id FROM super_admins WHERE prenom = 'Aya' AND nom = 'Beroukech')
);