const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./firebase-applet-config.json');

if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount)
    });
}

const db = getFirestore();
db.collection('users').get().then(snapshot => {
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
}).catch(console.error);
