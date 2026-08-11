const fs = require('fs');
let config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));

let content = fs.readFileSync('src/firebase.ts', 'utf8');

content = content.replace(/const firebaseConfig = \{[\s\S]*?\};/m, `const firebaseConfig = {
  apiKey: "${config.apiKey}",
  authDomain: "${config.authDomain}",
  projectId: "${config.projectId}",
  storageBucket: "${config.storageBucket}",
  messagingSenderId: "${config.messagingSenderId}",
  appId: "${config.appId}",
  measurementId: "${config.measurementId}"
};`);

if (config.firestoreDatabaseId) {
  content = content.replace(/const db = getFirestore\(app\);/, `const db = getFirestore(app, "${config.firestoreDatabaseId}");`);
}

fs.writeFileSync('src/firebase.ts', content);

// Also update RestaurantContext.tsx for the secondary app creation
let restContext = fs.readFileSync('src/context/RestaurantContext.tsx', 'utf8');
restContext = restContext.replace(/const firebaseConfig = \{[\s\S]*?appId: "1:1059583318795:web:1c97f584b9f74b9057200e"\n\s*\};/m, `const firebaseConfig = {
          apiKey: "${config.apiKey}",
          authDomain: "${config.authDomain}",
          projectId: "${config.projectId}",
          storageBucket: "${config.storageBucket}",
          messagingSenderId: "${config.messagingSenderId}",
          appId: "${config.appId}"
        };`);

fs.writeFileSync('src/context/RestaurantContext.tsx', restContext);
