const { initFirebase } = require('./firebase');

const connectDB = async () => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const isPlaceholder =
    !projectId ||
    projectId === 'your-firebase-project-id' ||
    !process.env.FIREBASE_PRIVATE_KEY ||
    process.env.FIREBASE_PRIVATE_KEY.includes('YOUR_PRIVATE_KEY_HERE');

  if (isPlaceholder) {
    console.warn(
      '\n⚠️  Firebase credentials not configured.\n' +
      '   Add real credentials to backend/.env:\n' +
      '   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY\n' +
      '   Get them from: Firebase Console → Project Settings → Service Accounts\n'
    );
    return;
  }

  try {
    initFirebase();
    console.log('Firestore connected successfully');
  } catch (error) {
    console.error('Firebase connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
