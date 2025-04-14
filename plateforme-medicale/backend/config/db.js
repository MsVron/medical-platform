const mysql = require('mysql2/promise');
require('dotenv').config();

// Créer un pool de connexions
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Fonction pour tester la connexion
async function testConnection() {
  try {
    const [rows] = await pool.execute('SELECT 1');
    console.log('Database connection successful:', rows);
  } catch (err) {
    console.error('Database connection failed:', err);
  }
}

// Tester la connexion une fois au démarrage
testConnection();

// Exporter le pool pour l'utiliser ailleurs dans l'application
module.exports = pool;
