// setAdmin.mjs
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
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