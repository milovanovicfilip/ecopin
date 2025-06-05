// generate-secret.mjs
import crypto from 'crypto';

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

// Generate and display the secret
const jwtSecret = generateSecret();
console.log('JWT_SECRET=', jwtSecret);
console.log('\nAdd this to your .env file:');
console.log(`JWT_SECRET=${jwtSecret}`);