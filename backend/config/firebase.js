const admin = require('firebase-admin');

try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (err) {
  console.warn('Firebase Admin failed to initialize. Using mock mode.', err.message);
  // Mock initializeApp if needed
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: 'academicx-ad128'
    });
  }
  admin.isMock = true;
}

module.exports = admin;
