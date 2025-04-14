const bcrypt = require('bcrypt');

const password = 'admin';
const saltRounds = 10; // Matches your database hash configuration

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    return;
  }
  console.log('Generated hash for "admin":', hash);
});