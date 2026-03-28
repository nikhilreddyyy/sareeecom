const admin = require('firebase-admin');

let db;
let auth;

function initFirebase() {
  if (admin.apps.length > 0) {
    db = admin.firestore();
    auth = admin.auth();
    return;
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : null;

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } else {
    // Use FIREBASE_* env vars individually (for local dev)
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          : undefined,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }

  db = admin.firestore();
  auth = admin.auth();

  console.log('Firebase initialized successfully');
}

function getDb() {
  if (!db) initFirebase();
  return db;
}

function getAuth() {
  if (!auth) initFirebase();
  return auth;
}

// Firestore helper: convert doc snapshot to plain object with id
function docToObject(doc) {
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

// Firestore helper: convert query snapshot to array of plain objects
function queryToArray(snapshot) {
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Generate a slug from a string
function generateSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Generate unique order number
function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// Firestore server timestamp
function serverTimestamp() {
  return admin.firestore.FieldValue.serverTimestamp();
}

// Firestore array union/remove helpers
function arrayUnion(...items) {
  return admin.firestore.FieldValue.arrayUnion(...items);
}

function arrayRemove(...items) {
  return admin.firestore.FieldValue.arrayRemove(...items);
}

function increment(n) {
  return admin.firestore.FieldValue.increment(n);
}

module.exports = {
  initFirebase,
  getDb,
  getAuth,
  admin,
  docToObject,
  queryToArray,
  generateSlug,
  generateOrderNumber,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
};
