// setAdmin.mjs
// Usage: node setAdmin.mjs <UID>
// If you see 'Cannot find package "firebase-admin"', run:
//   npm install firebase-admin

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Load service account key from file
const serviceAccount = JSON.parse(
  readFileSync('./expensetracker-c25fd-firebase-adminsdk-fbsvc-826ddb420c.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = process.argv[2];
if (!uid) {
  console.error('Usage: node setAdmin.mjs <UID>');
  process.exit(1);
}

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`Custom claim 'admin: true' set for user: ${uid}`);
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
