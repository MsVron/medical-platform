import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axios from 'axios';

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom_utilisateur: '',
    mot_de_passe: '',
    email: '',
    prenom: '',
    nom: '',
    telephone: '',
    institution_id: '',
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admins', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAdmins(response.data.admins);
    } catch (error) {
      console.error('Erreur lors de la récupération des administrateurs:', error);
    }
  };

  const handleOpen = (admin = null) => {
    if (admin) {
      setEditId(admin.id);
      setFormData({
        nom_utilisateur: admin.nom_utilisateur || '',
        mot_de_passe: '',
        email: admin.email,
        prenom: admin.prenom,
        nom: admin.nom,
        telephone: admin.telephone || '',
        institution_id: admin.institution_id || '',
      });
    } else {
      setEditId(null);
      setFormData({
        nom_utilisateur: '',
        mot_de_passe: '',
        email: '',
        prenom: '',
        nom: '',
        telephone: '',
        institution_id: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (editId) {
        await axios.put(`http://localhost:5000/api/admins/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('http://localhost:5000/api/admins', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchAdmins();
      handleClose();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admins/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchAdmins();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  return (
    <Box sx={{ mt: 4, p: 3, bgcolor: '#fff', borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des administrateurs
      </Typography>
      <Button variant="contained" color="primary" onClick={() => handleOpen()}>
        Ajouter un administrateur
      </Button>
      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Prénom</TableCell>
            <TableCell>Nom</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Téléphone</TableCell>
            <TableCell>Actif</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {admins.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell>{admin.prenom}</TableCell>
              <TableCell>{admin.nom}</TableCell>
              <TableCell>{admin.email}</TableCell>
              <TableCell>{admin.telephone}</TableCell>
              <TableCell>{admin.est_actif ? 'Oui' : 'Non'}</TableCell>
              <TableCell>
                <Button color="primary" onClick={() => handleOpen(admin)}>
                  Modifier
                </Button>
                <Button color="error" onClick={() => handleDelete(admin.id)}>
                  Supprimer
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editId ? 'Modifier un administrateur' : 'Ajouter un administrateur'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nom d'utilisateur"
            fullWidth
            value={formData.nom_utilisateur}
            onChange={(e) => setFormData({ ...formData, nom_utilisateur: e.target.value })}
            disabled={!!editId}
          />
          {!editId && (
            <TextField
              margin="dense"
              label="Mot de passe"
              type="password"
              fullWidth
              value={formData.mot_de_passe}
              onChange={(e) => setFormData({ ...formData, mot_de_passe: e.target.value })}
            />
          )}
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
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
            label="Téléphone"
            fullWidth
            value={formData.telephone}
            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
          />
          <TextField
            margin="dense"
            label="ID Institution"
            fullWidth
            value={formData.institution_id}
            onChange={(e) => setFormData({ ...formData, institution_id: e.target.value })}
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

export default ManageAdmins;