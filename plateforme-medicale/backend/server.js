const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');

app.use('/api/auth', authRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API de la Plateforme Médicale' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});