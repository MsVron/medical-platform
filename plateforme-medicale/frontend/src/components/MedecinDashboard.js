import React, { useState, useEffect } from 'react';
import {
  Box, Typography, CircularProgress, Button, Tabs, Tab, Card, CardContent, CardActions,
  Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem,
  FormControl, InputLabel, Checkbox, FormControlLabel, Autocomplete, Chip, Divider
} from '@mui/material';
import axios from 'axios';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

const MedecinDashboard = () => {
  const [data, setData] = useState({ medecin: null, institutions: [], availabilities: [], absences: [], patients: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [openAvailability, setOpenAvailability] = useState(false);
  const [openAbsence, setOpenAbsence] = useState(false);
  const [openPatient, setOpenPatient] = useState(false);
  const [availabilityForm, setAvailabilityForm] = useState({
    id: null, institution_id: '', jours_semaine: [], heure_debut: '09:00', heure_fin: '17:00',
    intervalle_minutes: 30, est_actif: true
  });
  const [absenceForm, setAbsenceForm] = useState({ date_debut: null, date_fin: null, motif: '' });
  const [patientForm, setPatientForm] = useState({
    prenom: '', nom: '', date_naissance: null, sexe: '', CNE: '', email: '',
    telephone: '', adresse: '', ville: '', code_postal: '', pays: 'Maroc'
  });
  const [success, setSuccess] = useState('');

  const joursSemaine = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medecinResponse, institutionsResponse, availabilitiesResponse, absencesResponse, patientsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/medecin/dashboard', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get('http://localhost:5000/api/medecin/institutions', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get('http://localhost:5000/api/medecin/disponibilites', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get('http://localhost:5000/api/medecin/absences', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get('http://localhost:5000/api/medecin/patients', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          })
        ]);
        setData({
          medecin: medecinResponse.data.medecin,
          institutions: institutionsResponse.data.institutions,
          availabilities: availabilitiesResponse.data.availabilities,
          absences: absencesResponse.data.absences,
          patients: patientsResponse.data.patients
        });
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        setError(error.response?.data?.message || 'Erreur lors de la récupération des données');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleOpenAvailability = (availability = null) => {
    if (availability) {
      setAvailabilityForm({
        id: availability.id,
        institution_id: availability.institution_id,
        jours_semaine: [availability.jour_semaine],
        heure_debut: availability.heure_debut,
        heure_fin: availability.heure_fin,
        intervalle_minutes: availability.intervalle_minutes,
        est_actif: availability.est_actif
      });
    } else {
      setAvailabilityForm({
        id: null, institution_id: '', jours_semaine: [], heure_debut: '09:00', heure_fin: '17:00',
        intervalle_minutes: 30, est_actif: true
      });
    }
    setError('');
    setSuccess('');
    setOpenAvailability(true);
  };

  const handleCloseAvailability = () => {
    setOpenAvailability(false);
    setAvailabilityForm({
      id: null, institution_id: '', jours_semaine: [], heure_debut: '09:00', heure_fin: '17:00',
      intervalle_minutes: 30, est_actif: true
    });
  };

  const handleSubmitAvailability = async () => {
    try {
      if (!availabilityForm.institution_id || !availabilityForm.jours_semaine.length ||
          !availabilityForm.heure_debut || !availabilityForm.heure_fin) {
        setError('Tous les champs obligatoires doivent être remplis');
        return;
      }

      const token = localStorage.getItem('token');
      if (availabilityForm.id) {
        await axios.put(
          `http://localhost:5000/api/medecin/disponibilites/${availabilityForm.id}`,
          { ...availabilityForm, jour_semaine: availabilityForm.jours_semaine[0] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Disponibilité mise à jour avec succès');
      } else {
        await axios.post(
          'http://localhost:5000/api/medecin/disponibilites',
          availabilityForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Disponibilités ajoutées avec succès');
      }

      const response = await axios.get('http://localhost:5000/api/medecin/disponibilites', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData({ ...data, availabilities: response.data.availabilities });
      handleCloseAvailability();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setError(error.response?.data?.message || 'Erreur lors de l’ajout/modification de la disponibilité');
    }
  };

  const handleDeleteAvailability = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/medecin/disponibilites/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSuccess('Disponibilité supprimée avec succès');
      const response = await axios.get('http://localhost:5000/api/medecin/disponibilites', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setData({ ...data, availabilities: response.data.availabilities });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError(error.response?.data?.message || 'Erreur lors de la suppression de la disponibilité');
    }
  };

  const handleOpenAbsence = () => {
    setAbsenceForm({ date_debut: null, date_fin: null, motif: '' });
    setError('');
    setSuccess('');
    setOpenAbsence(true);
  };

  const handleCloseAbsence = () => {
    setOpenAbsence(false);
  };

  const handleSubmitAbsence = async () => {
    try {
      if (!absenceForm.date_debut || !absenceForm.date_fin) {
        setError('Les dates de début et de fin sont obligatoires');
        return;
      }

      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/medecin/absences', absenceForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Absence ajoutée avec succès');

      const response = await axios.get('http://localhost:5000/api/medecin/absences', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData({ ...data, absences: response.data.absences });
      handleCloseAbsence();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setError(error.response?.data?.message || 'Erreur lors de l’ajout de l’absence');
    }
  };

  const handleDeleteAbsence = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/medecin/absences/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSuccess('Absence supprimée avec succès');
      const response = await axios.get('http://localhost:5000/api/medecin/absences', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setData({ ...data, absences: response.data.absences });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError(error.response?.data?.message || 'Erreur lors de la suppression de l’absence');
    }
  };

  const handleOpenPatient = () => {
    setPatientForm({
      prenom: '', nom: '', date_naissance: null, sexe: '', CNE: '', email: '',
      telephone: '', adresse: '', ville: '', code_postal: '', pays: 'France'
    });
    setError('');
    setSuccess('');
    setOpenPatient(true);
  };

  const handleClosePatient = () => {
    setOpenPatient(false);
  };

  const handleSubmitPatient = async () => {
    try {
      if (!patientForm.prenom || !patientForm.nom || !patientForm.date_naissance || !patientForm.sexe) {
        setError('Prénom, nom, date de naissance et sexe sont obligatoires');
        return;
      }

      const formattedPatient = {
        ...patientForm,
        date_naissance: patientForm.date_naissance ? format(patientForm.date_naissance, 'yyyy-MM-dd') : null
      };

      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/medecin/patients', formattedPatient, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Patient ajouté avec succès');

      const response = await axios.get('http://localhost:5000/api/medecin/patients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData({ ...data, patients: response.data.patients });
      handleClosePatient();
    } catch (error) {
      console.error('Erreur lors de l’ajout du patient:', error);
      setError(error.response?.data?.message || 'Erreur lors de l’ajout du patient');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement...</Typography>
      </Box>
    );
  }

  if (error && !success) {
    return (
      <Box sx={{ mt: 4, p: 3, bgcolor: '#fff', borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h4" gutterBottom>
          Espace Médecin
        </Typography>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2, minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Espace Médecin
      </Typography>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Bienvenue, {data.medecin.prenom} {data.medecin.nom}
      </Typography>
      <Typography sx={{ mb: 2 }}>
        Spécialité: {data.medecin.specialite_nom || 'Non spécifiée'} | Institution: {data.medecin.institution_nom || 'Aucune'}
      </Typography>

      {success && (
        <Typography color="success.main" sx={{ mb: 2, bgcolor: '#e8f5e9', p: 1, borderRadius: 1 }}>
          {success}
        </Typography>
      )}

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3, bgcolor: '#fff', borderRadius: 1 }}>
        <Tab label="Disponibilités" />
        <Tab label="Absences" />
        <Tab label="Patients" />
      </Tabs>

      {/* Disponibilités Section */}
      {tabValue === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
              Disponibilités Hebdomadaires
            </Typography>
            <Button variant="contained" color="primary" onClick={() => handleOpenAvailability()}>
              Ajouter une disponibilité
            </Button>
          </Box>
          <Grid container spacing={2}>
            {data.availabilities.length === 0 ? (
              <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                Aucune disponibilité enregistrée.
              </Typography>
            ) : (
              data.availabilities.map((availability) => (
                <Grid item xs={12} sm={6} md={4} key={availability.id}>
                  <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {availability.institution_nom}
                      </Typography>
                      <Typography><strong>Jour:</strong> {availability.jour_semaine}</Typography>
                      <Typography><strong>Horaire:</strong> {availability.heure_debut} - {availability.heure_fin}</Typography>
                      <Typography><strong>Intervalle:</strong> {availability.intervalle_minutes} min</Typography>
                      <Typography><strong>Statut:</strong> {availability.est_actif ? 'Actif' : 'Inactif'}</Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" color="primary" onClick={() => handleOpenAvailability(availability)}>
                        Modifier
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDeleteAvailability(availability.id)}>
                        Supprimer
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      )}

      {/* Absences Section */}
      {tabValue === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
              Absences Exceptionnelles
            </Typography>
            <Button variant="contained" color="primary" onClick={handleOpenAbsence}>
              Ajouter une absence
            </Button>
          </Box>
          <Grid container spacing={2}>
            {data.absences.length === 0 ? (
              <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                Aucune absence enregistrée.
              </Typography>
            ) : (
              data.absences.map((absence) => (
                <Grid item xs={12} sm={6} md={4} key={absence.id}>
                  <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        Absence
                      </Typography>
                      <Typography><strong>Début:</strong> {new Date(absence.date_debut).toLocaleString()}</Typography>
                      <Typography><strong>Fin:</strong> {new Date(absence.date_fin).toLocaleString()}</Typography>
                      <Typography><strong>Motif:</strong> {absence.motif || 'Non spécifié'}</Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" color="error" onClick={() => handleDeleteAbsence(absence.id)}>
                        Supprimer
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      )}

      {/* Patients Section */}
      {tabValue === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
              Mes Patients
            </Typography>
            <Button variant="contained" color="primary" onClick={handleOpenPatient}>
              Ajouter un patient
            </Button>
          </Box>
          <Grid container spacing={2}>
            {data.patients.length === 0 ? (
              <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                Aucun patient enregistré.
              </Typography>
            ) : (
              data.patients.map((patient) => (
                <Grid item xs={12} sm={6} md={4} key={patient.id}>
                  <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {patient.prenom} {patient.nom}
                      </Typography>
                      <Typography><strong>Date de naissance:</strong> {new Date(patient.date_naissance).toLocaleDateString()}</Typography>
                      <Typography><strong>Sexe:</strong> {patient.sexe}</Typography>
                      {patient.CNE && <Typography><strong>CNE:</strong> {patient.CNE}</Typography>}
                      {patient.email && <Typography><strong>Email:</strong> {patient.email}</Typography>}
                      {patient.telephone && <Typography><strong>Téléphone:</strong> {patient.telephone}</Typography>}
                      {patient.adresse && <Typography><strong>Adresse:</strong> {patient.adresse}, {patient.ville} {patient.code_postal}, {patient.pays}</Typography>}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      )}

      {/* Availability Dialog */}
      <Dialog open={openAvailability} onClose={handleCloseAvailability} maxWidth="sm" fullWidth>
        <DialogTitle>{availabilityForm.id ? 'Modifier Disponibilité' : 'Ajouter Disponibilité'}</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ mb: 2, bgcolor: '#ffebee', p: 1, borderRadius: 1 }}>
              {error}
            </Typography>
          )}
          <Autocomplete
            options={data.institutions}
            getOptionLabel={(option) => `${option.nom} (${option.type})`}
            value={data.institutions.find((i) => i.id === availabilityForm.institution_id) || null}
            onChange={(event, newValue) => {
              setAvailabilityForm({ ...availabilityForm, institution_id: newValue ? newValue.id : '' });
            }}
            renderInput={(params) => (
              <TextField {...params} margin="dense" label="Institution" fullWidth />
            )}
            disabled={availabilityForm.id !== null}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Jours de la semaine</InputLabel>
            <Select
              multiple
              value={availabilityForm.jours_semaine}
              onChange={(e) => {
                const value = e.target.value;
                if (value.includes('all')) {
                  setAvailabilityForm({ ...availabilityForm, jours_semaine: joursSemaine });
                } else {
                  setAvailabilityForm({ ...availabilityForm, jours_semaine: value });
                }
              }}
              label="Jours de la semaine"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
              disabled={availabilityForm.id !== null}
            >
              {!availabilityForm.id && (
                <MenuItem value="all">
                  <em>Toute la semaine</em>
                </MenuItem>
              )}
              {joursSemaine.map((jour) => (
                <MenuItem key={jour} value={jour}>{jour}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Heure de début"
            type="time"
            fullWidth
            value={availabilityForm.heure_debut}
            onChange={(e) => setAvailabilityForm({ ...availabilityForm, heure_debut: e.target.value })}
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 300 }}
          />
          <TextField
            margin="dense"
            label="Heure de fin"
            type="time"
            fullWidth
            value={availabilityForm.heure_fin}
            onChange={(e) => setAvailabilityForm({ ...availabilityForm, heure_fin: e.target.value })}
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 300 }}
          />
          <TextField
            margin="dense"
            label="Intervalle (minutes)"
            type="number"
            fullWidth
            value={availabilityForm.intervalle_minutes}
            onChange={(e) => setAvailabilityForm({ ...availabilityForm, intervalle_minutes: Number(e.target.value) })}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={availabilityForm.est_actif}
                onChange={(e) => setAvailabilityForm({ ...availabilityForm, est_actif: e.target.checked })}
              />
            }
            label="Actif"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAvailability}>Annuler</Button>
          <Button onClick={handleSubmitAvailability} variant="contained">
            {availabilityForm.id ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Absence Dialog */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Dialog open={openAbsence} onClose={handleCloseAbsence} maxWidth="sm" fullWidth>
          <DialogTitle>Ajouter une Absence</DialogTitle>
          <DialogContent>
            {error && (
              <Typography color="error" sx={{ mb: 2, bgcolor: '# instrumentos', p: 1, borderRadius: 1 }}>
                {error}
              </Typography>
            )}
            <DateTimePicker
              label="Date et heure de début"
              value={absenceForm.date_debut}
              onChange={(newValue) => setAbsenceForm({ ...absenceForm, date_debut: newValue })}
              renderInput={(params) => <TextField {...params} margin="dense" fullWidth />}
            />
            <DateTimePicker
              label="Date et heure de fin"
              value={absenceForm.date_fin}
              onChange={(newValue) => setAbsenceForm({ ...absenceForm, date_fin: newValue })}
              renderInput={(params) => <TextField {...params} margin="dense" fullWidth />}
            />
            <TextField
              margin="dense"
              label="Motif (optionnel)"
              fullWidth
              value={absenceForm.motif}
              onChange={(e) => setAbsenceForm({ ...absenceForm, motif: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAbsence}>Annuler</Button>
            <Button onClick={handleSubmitAbsence} variant="contained">
              Ajouter
            </Button>
          </DialogActions>
        </Dialog>

        {/* Patient Dialog */}
        <Dialog open={openPatient} onClose={handleClosePatient} maxWidth="md" fullWidth>
          <DialogTitle>Ajouter un Patient</DialogTitle>
          <DialogContent>
            {error && (
              <Typography color="error" sx={{ mb: 2, bgcolor: '#ffebee', p: 1, borderRadius: 1 }}>
                {error}
              </Typography>
            )}
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
              Informations Personnelles
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Prénom *"
                  fullWidth
                  value={patientForm.prenom}
                  onChange={(e) => setPatientForm({ ...patientForm, prenom: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Nom *"
                  fullWidth
                  value={patientForm.nom}
                  onChange={(e) => setPatientForm({ ...patientForm, nom: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Date de naissance *"
                    value={patientForm.date_naissance}
                    onChange={(newValue) => setPatientForm({ ...patientForm, date_naissance: newValue })}
                    renderInput={(params) => <TextField {...params} margin="dense" fullWidth />}
                    maxDate={new Date()}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Sexe *</InputLabel>
                  <Select
                    value={patientForm.sexe}
                    onChange={(e) => setPatientForm({ ...patientForm, sexe: e.target.value })}
                    label="Sexe"
                  >
                    <MenuItem value="M">Masculin</MenuItem>
                    <MenuItem value="F">Féminin</MenuItem>
                    <MenuItem value="Autre">Autre</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="CNE"
                  fullWidth
                  value={patientForm.CNE}
                  onChange={(e) => setPatientForm({ ...patientForm, CNE: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Email"
                  type="email"
                  fullWidth
                  value={patientForm.email}
                  onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Téléphone"
                  fullWidth
                  value={patientForm.telephone}
                  onChange={(e) => setPatientForm({ ...patientForm, telephone: e.target.value })}
                />
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
              Adresse
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  label="Adresse"
                  fullWidth
                  value={patientForm.adresse}
                  onChange={(e) => setPatientForm({ ...patientForm, adresse: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  margin="dense"
                  label="Ville"
                  fullWidth
                  value={patientForm.ville}
                  onChange={(e) => setPatientForm({ ...patientForm, ville: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  margin="dense"
                  label="Code postal"
                  fullWidth
                  value={patientForm.code_postal}
                  onChange={(e) => setPatientForm({ ...patientForm, code_postal: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  margin="dense"
                  label="Pays"
                  fullWidth
                  value={patientForm.pays}
                  onChange={(e) => setPatientForm({ ...patientForm, pays: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePatient}>Annuler</Button>
            <Button onClick={handleSubmitPatient} variant="contained">
              Ajouter
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </Box>
  );
};

export default MedecinDashboard;