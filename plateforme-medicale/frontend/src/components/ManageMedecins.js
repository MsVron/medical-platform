import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormControlLabel,
    Checkbox,
    Autocomplete,
} from "@mui/material";
import axios from "axios";

const ManageMedecins = () => {
    const [medecins, setMedecins] = useState([]);
    const [specialites, setSpecialites] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [open, setOpen] = useState(false);
    const [isPrivateCabinet, setIsPrivateCabinet] = useState(false);
    const [formData, setFormData] = useState({
        nom_utilisateur: "",
        mot_de_passe: "",
        email: "",
        prenom: "",
        nom: "",
        specialite_id: "",
        numero_ordre: "",
        telephone: "",
        email_professionnel: "",
        photo_url: "",
        biographie: "",
        institution_id: "",
        institution_nom: "",
        institution_type: "",
        adresse: "",
        ville: "",
        code_postal: "",
        pays: "Maroc",
        est_actif: true, // Add est_actif with default true
    });
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchMedecins();
        fetchSpecialites();
        fetchInstitutions();
    }, []);

    const fetchMedecins = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/medecins?includeInactive=true', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setMedecins(response.data.medecins);
      } catch (error) {
        console.error('Erreur lors de la récupération des médecins:', error);
        setError(error.response?.data?.message || 'Erreur lors de la récupération des médecins');
      }
    };

    const fetchSpecialites = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/specialites",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );
            setSpecialites(response.data.specialites);
        } catch (error) {
            console.error(
                "Erreur lors de la récupération des spécialités:",
                error
            );
            setError(
                error.response?.data?.message ||
                    "Erreur lors de la récupération des spécialités"
            );
        }
    };

    const fetchInstitutions = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/institutions",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );
            setInstitutions(response.data.institutions);
        } catch (error) {
            console.error(
                "Erreur lors de la récupération des institutions:",
                error
            );
            setError(
                error.response?.data?.message ||
                    "Erreur lors de la récupération des institutions"
            );
        }
    };

    const handleOpen = (medecin = null) => {
        if (medecin) {
            setEditId(medecin.id);
            const isCabinet = medecin.institution_type === "cabinet privé";
            setIsPrivateCabinet(isCabinet);
            setFormData({
                nom_utilisateur: medecin.nom_utilisateur || "",
                mot_de_passe: "",
                email: medecin.email,
                prenom: medecin.prenom,
                nom: medecin.nom,
                specialite_id: medecin.specialite_id || "",
                numero_ordre: medecin.numero_ordre,
                telephone: medecin.telephone || "",
                email_professionnel: medecin.email_professionnel || "",
                photo_url: medecin.photo_url || "",
                biographie: medecin.biographie || "",
                institution_id: isCabinet ? "" : medecin.institution_id || "",
                institution_nom: isCabinet ? medecin.institution_nom || "" : "",
                institution_type: isCabinet ? "cabinet privé" : "",
                adresse: medecin.adresse || "",
                ville: medecin.ville || "",
                code_postal: medecin.code_postal || "",
                pays: medecin.pays || "Maroc",
                est_actif: medecin.est_actif, // Set est_actif from medecin data
            });
        } else {
            setEditId(null);
            setIsPrivateCabinet(false);
            setFormData({
                nom_utilisateur: "",
                mot_de_passe: "",
                email: "",
                prenom: "",
                nom: "",
                specialite_id: "",
                numero_ordre: "",
                telephone: "",
                email_professionnel: "",
                photo_url: "",
                biographie: "",
                institution_id: "",
                institution_nom: "",
                institution_type: "",
                adresse: "",
                ville: "",
                code_postal: "",
                pays: "Maroc",
                est_actif: true, // Default to true for new doctors
            });
        }
        setError("");
        setSuccess("");
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditId(null);
        setIsPrivateCabinet(false);
        setError("");
        setSuccess("");
    };

    const handleSubmit = async () => {
        console.log("handleSubmit called with formData:", formData);
        try {
            if (
                !formData.nom_utilisateur ||
                !formData.mot_de_passe ||
                !formData.email ||
                !formData.prenom ||
                !formData.nom ||
                !formData.specialite_id ||
                !formData.numero_ordre
            ) {
                setError("Tous les champs obligatoires doivent être remplis");
                return;
            }
            if (isPrivateCabinet && !formData.institution_nom) {
                setError("Le nom du cabinet privé est requis");
                return;
            }

            const token = localStorage.getItem("token");
            if (!token) {
                setError(
                    "Vous devez être connecté pour effectuer cette action"
                );
                return;
            }

            const submitData = { ...formData };
            if (isPrivateCabinet) {
                submitData.institution_type = "cabinet privé";
                delete submitData.institution_id;
            } else {
                delete submitData.institution_nom;
                delete submitData.institution_type;
            }

            if (editId) {
                console.log("Sending PUT request to update médecin:", editId);
                await axios.put(
                    `http://localhost:5000/api/medecins/${editId}`,
                    submitData,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setSuccess("Médecin modifié avec succès");
            } else {
                console.log("Sending POST request to add médecin");
                await axios.post(
                    "http://localhost:5000/api/medecins",
                    submitData,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setSuccess("Médecin ajouté avec succès");
            }
            await fetchMedecins();
            handleClose();
        } catch (error) {
            console.error("Erreur lors de la soumission:", error);
            setError(
                error.response?.data?.message ||
                    "Erreur lors de l'ajout/modification du médecin"
            );
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/medecins/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setSuccess("Médecin supprimé avec succès");
            fetchMedecins();
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            setError(
                error.response?.data?.message ||
                    "Erreur lors de la suppression du médecin"
            );
        }
    };

    return (
        <Box sx={{ mt: 4, p: 3, bgcolor: "#fff", borderRadius: 2 }}>
            <Typography variant="h4" gutterBottom>
                Gestion des médecins
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
            <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpen()}>
                Ajouter un médecin
            </Button>
            <Table sx={{ mt: 2 }}>
                <TableHead>
                    <TableRow>
                        <TableCell>Prénom</TableCell>
                        <TableCell>Nom</TableCell>
                        <TableCell>Spécialité</TableCell>
                        <TableCell>Numéro d'ordre</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Téléphone</TableCell>
                        <TableCell>Institution</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Adresse</TableCell>
                        <TableCell>Ville</TableCell>
                        <TableCell>Actif</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {medecins.map((medecin) => (
                        <TableRow key={medecin.id}>
                            <TableCell>{medecin.prenom}</TableCell>
                            <TableCell>{medecin.nom}</TableCell>
                            <TableCell>{medecin.specialite_nom}</TableCell>
                            <TableCell>{medecin.numero_ordre}</TableCell>
                            <TableCell>{medecin.email}</TableCell>
                            <TableCell>{medecin.telephone}</TableCell>
                            <TableCell>
                                {medecin.institution_nom || "Aucune"}
                            </TableCell>
                            <TableCell>
                                {medecin.institution_type || "-"}
                            </TableCell>
                            <TableCell>{medecin.adresse || "-"}</TableCell>
                            <TableCell>{medecin.ville || "-"}</TableCell>
                            <TableCell>
                                {medecin.est_actif ? "Oui" : "Non"}
                            </TableCell>
                            <TableCell>
                                <Button
                                    color="primary"
                                    onClick={() => handleOpen(medecin)}>
                                    Modifier
                                </Button>
                                <Button
                                    color="error"
                                    onClick={() => handleDelete(medecin.id)}>
                                    Supprimer
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    {editId ? "Modifier un médecin" : "Ajouter un médecin"}
                </DialogTitle>
                <DialogContent>
                    {error && (
                        <Typography color="error" sx={{ mb: 2 }}>
                            {error}
                        </Typography>
                    )}
                    <TextField
                        margin="dense"
                        label="Nom d'utilisateur"
                        fullWidth
                        value={formData.nom_utilisateur}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                nom_utilisateur: e.target.value,
                            })
                        }
                        disabled={!!editId}
                    />
                    {!editId && (
                        <TextField
                            margin="dense"
                            label="Mot de passe"
                            type="password"
                            fullWidth
                            value={formData.mot_de_passe}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    mot_de_passe: e.target.value,
                                })
                            }
                        />
                    )}
                    <TextField
                        margin="dense"
                        label="Email"
                        fullWidth
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                    />
                    <TextField
                        margin="dense"
                        label="Prénom"
                        fullWidth
                        value={formData.prenom}
                        onChange={(e) =>
                            setFormData({ ...formData, prenom: e.target.value })
                        }
                    />
                    <TextField
                        margin="dense"
                        label="Nom"
                        fullWidth
                        value={formData.nom}
                        onChange={(e) =>
                            setFormData({ ...formData, nom: e.target.value })
                        }
                    />
                    <Autocomplete
                        options={specialites}
                        getOptionLabel={(option) => option.nom || ""}
                        value={
                            specialites.find(
                                (s) => s.id === formData.specialite_id
                            ) || null
                        }
                        onChange={(event, newValue) => {
                            setFormData({
                                ...formData,
                                specialite_id: newValue ? newValue.id : "",
                            });
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                margin="dense"
                                label="Spécialité"
                                fullWidth
                                placeholder="Tapez pour rechercher une spécialité"
                            />
                        )}
                        noOptionsText="Aucune spécialité trouvée"
                    />
                    <TextField
                        margin="dense"
                        label="Numéro d'ordre"
                        fullWidth
                        value={formData.numero_ordre}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                numero_ordre: e.target.value,
                            })
                        }
                    />
                    <TextField
                        margin="dense"
                        label="Téléphone"
                        fullWidth
                        value={formData.telephone}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                telephone: e.target.value,
                            })
                        }
                    />
                    <TextField
                        margin="dense"
                        label="Email professionnel"
                        fullWidth
                        value={formData.email_professionnel}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                email_professionnel: e.target.value,
                            })
                        }
                    />
                    <TextField
                        margin="dense"
                        label="URL de la photo"
                        fullWidth
                        value={formData.photo_url}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                photo_url: e.target.value,
                            })
                        }
                    />
                    <TextField
                        margin="dense"
                        label="Biographie"
                        fullWidth
                        multiline
                        rows={4}
                        value={formData.biographie}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                biographie: e.target.value,
                            })
                        }
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={
                                    formData.est_actif !== undefined
                                        ? formData.est_actif
                                        : true
                                }
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        est_actif: e.target.checked,
                                    })
                                }
                            />
                        }
                        label="Actif"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isPrivateCabinet}
                                onChange={(e) => {
                                    setIsPrivateCabinet(e.target.checked);
                                    setFormData({
                                        ...formData,
                                        institution_id: "",
                                        institution_nom: e.target.checked
                                            ? formData.institution_nom
                                            : "",
                                        institution_type: e.target.checked
                                            ? "cabinet privé"
                                            : "",
                                    });
                                }}
                            />
                        }
                        label="Cabinet privé"
                    />
                    {isPrivateCabinet ? (
                        <TextField
                            margin="dense"
                            label="Nom du cabinet"
                            fullWidth
                            value={formData.institution_nom}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    institution_nom: e.target.value,
                                })
                            }
                        />
                    ) : (
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Institution</InputLabel>
                            <Select
                                value={formData.institution_id}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        institution_id: e.target.value,
                                    })
                                }
                                label="Institution">
                                <MenuItem value="">
                                    <em>Aucune</em>
                                </MenuItem>
                                {institutions.map((institution) => (
                                    <MenuItem
                                        key={institution.id}
                                        value={institution.id}>
                                        {institution.nom} ({institution.type})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    <TextField
                        margin="dense"
                        label="Adresse"
                        fullWidth
                        value={formData.adresse}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                adresse: e.target.value,
                            })
                        }
                    />
                    <TextField
                        margin="dense"
                        label="Ville"
                        fullWidth
                        value={formData.ville}
                        onChange={(e) =>
                            setFormData({ ...formData, ville: e.target.value })
                        }
                    />
                    <TextField
                        margin="dense"
                        label="Code postal"
                        fullWidth
                        value={formData.code_postal}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                code_postal: e.target.value,
                            })
                        }
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Pays</InputLabel>
                        <Select
                            value={formData.pays}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    pays: e.target.value,
                                })
                            }
                            label="Pays">
                            <MenuItem value="Maroc">Maroc</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Annuler</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editId ? "Modifier" : "Ajouter"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManageMedecins;
