import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Checkbox,
  MenuItem
} from '@mui/material';
import axios from 'axios';

const ManagePatients = () => {
  const [patients, setPatients] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom_utilisateur: '', mot_de_passe: '', prenom: '', nom: '', date_naissance: '',
    sexe: '', email: '', telephone: '', adresse: '', ville: '', code_postal: '',
    pays: 'Maroc', est_actif: true, CNE: '', groupe_sanguin: ''
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patients', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPatients(response.data.patients);
    } catch (error) {
      console.error('Erreur lors de la récupération des patients:', error);
      setError(error.response?.data?.message || 'Erreur lors de la récupération des patients');
    }
  };

  const handleOpen = (patient = null) => {
    if (patient) {
      setEditId(patient.id);
      setFormData({
        nom_utilisateur: patient.nom_utilisateur || '',
        mot_de_passe: '',
        prenom: patient.prenom,
        nom: patient.nom,
        date_naissance: patient.date_naissance,
        sexe: patient.sexe,
        email: patient.email || '',
        telephone: patient.telephone || '',
        adresse: patient.adresse || '',
        ville: patient.ville || '',
        code_postal: patient.code_postal || '',
        pays: patient.pays || 'Maroc',
        est_actif: patient.est_actif,
        CNE: patient.CNE || '',
        groupe_sanguin: patient.groupe_sanguin || ''
      });
    } else {
      setEditId(null);
      setFormData({
        nom_utilisateur: '', mot_de_passe: '', prenom: '', nom: '', date_naissance: '',
        sexe: '', email: '', telephone: '', adresse: '', ville: '', code_postal: '',
        pays: 'Maroc', est_actif: true, CNE: '', groupe_sanguin: ''
      });
    }
    setError('');
    setSuccess('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    try {
      if (!formData.prenom || !formData.nom || !formData.date_naissance || !formData.sexe) {
        setError('Prénom, nom, date de naissance et sexe sont obligatoires');
        return;
      }
      if (!editId && (!formData.nom_utilisateur || !formData.mot_de_passe)) {
        setError('Nom d\'utilisateur et mot de passe sont obligatoires pour un nouveau patient');
        return;
      }
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vous devez être connecté pour effectuer cette action');
        return;
      }

      if (editId) {
        await axios.put(`http://localhost:5000/api/patients/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Patient modifié avec succès');
      } else {
        await axios.post('http://localhost:5000/api/patients', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Patient ajouté avec succès');
      }
      await fetchPatients();
      handleClose();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setError(error.response?.data?.message || 'Erreur lors de l\'ajout/modification du patient');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/patients/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSuccess('Patient supprimé avec succès');
      fetchPatients();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError(error.response?.data?.message || 'Erreur lors de la suppression du patient');
    }
  };

  return (
    <Box sx={{ mt: 4, p: 3, bgcolor: '#fff', borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des patients
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {success && (
        <Typography color="#4caf50" sx={{ mb: 2 }}>
          {success}
        </Typography>
      )}
      <Button variant="contained" color="primary" onClick={() => handleOpen()}>
        Ajouter un patient
      </Button>
      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Prénom</TableCell>
            <TableCell>Nom</TableCell>
            <TableCell>Date de naissance</TableCell>
            <TableCell>Sexe</TableCell>
            <TableCell>CNE</TableCell>
            <TableCell>Groupe sanguin</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Téléphone</TableCell>
            <TableCell>Ville</TableCell>
            <TableCell>Actif</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell>{patient.prenom}</TableCell>
              <TableCell>{patient.nom}</TableCell>
              <TableCell>{patient.date_naissance}</TableCell>
              <TableCell>{patient.sexe}</TableCell>
              <TableCell>{patient.CNE || '-'}</TableCell>
              <TableCell>{patient.groupe_sanguin || '-'}</TableCell>
              <TableCell>{patient.email || '-'}</TableCell>
              <TableCell>{patient.telephone || '-'}</TableCell>
              <TableCell>{patient.ville || '-'}</TableCell>
              <TableCell>{patient.est_actif ? 'Oui' : 'Non'}</TableCell>
              <TableCell>
                <Button color="primary" onClick={() => handleOpen(patient)}>
                  Modifier
                </Button>
                <Button color="error" onClick={() => handleDelete(patient.id)}>
                  Supprimer
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editId ? 'Modifier un patient' : 'Ajouter un patient'}</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          {!editId && (
            <>
              <TextField
                margin="dense"
                label="Nom d'utilisateur"
                fullWidth
                value={formData.nom_utilisateur}
                onChange={(e) => setFormData({ ...formData, nom_utilisateur: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Mot de passe"
                type="password"
                fullWidth
                value={formData.mot_de_passe}
                onChange={(e) => setFormData({ ...formData, mot_de_passe: e.target.value })}
              />
            </>
          )}
          <TextField
            margin="dense"
            label="Prénom"
            fullWidth
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Nom"
            fullWidth
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Date de naissance"
            type="date"
            fullWidth
            value={formData.date_naissance}
            onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="Sexe"
            fullWidth
            value={formData.sexe}
            onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
            select
          >
            <MenuItem value="M">Masculin</MenuItem>
            <MenuItem value="F">Féminin</MenuItem>
            <MenuItem value="Autre">Autre</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="CNE"
            fullWidth
            value={formData.CNE}
            onChange={(e) => setFormData({ ...formData, CNE: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Groupe sanguin"
            fullWidth
            value={formData.groupe_sanguin}
            onChange={(e) => setFormData({ ...formData, groupe_sanguin: e.target.value })}
            select
          >
            <MenuItem value="A+">A+</MenuItem>
            <MenuItem value="A-">A-</MenuItem>
            <MenuItem value="B+">B+</MenuItem>
            <MenuItem value="B-">B-</MenuItem>
            <MenuItem value="AB+">AB+</MenuItem>
            <MenuItem value="AB-">AB-</MenuItem>
            <MenuItem value="O+">O+</MenuItem>
            <MenuItem value="O-">O-</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Téléphone"
            fullWidth
            value={formData.telephone}
            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Adresse"
            fullWidth
            value={formData.adresse}
            onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Ville"
            fullWidth
            value={formData.ville}
            onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Code postal"
            fullWidth
            value={formData.code_postal}
            onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Pays"
            fullWidth
            value={formData.pays}
            onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
            select
          >
            <MenuItem value="Maroc">Maroc</MenuItem>
            <MenuItem value="France">France</MenuItem>
            <MenuItem value="Algérie">Algérie</MenuItem>
          </TextField>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.est_actif}
                onChange={(e) => setFormData({ ...formData, est_actif: e.target.checked })}
              />
            }
            label="Actif"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editId ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagePatients;