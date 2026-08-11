const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously } = require('firebase/auth');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const firebaseConfig = {
  projectId: config.projectId,
  appId: config.appId,
  apiKey: config.apiKey,
  authDomain: config.authDomain
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

(async () => {
  try {
    const cred = await signInAnonymously(auth);
    console.log('Success:', cred.user.uid);
  } catch(e) {
    console.log('Error:', e.message);
  }
})();
