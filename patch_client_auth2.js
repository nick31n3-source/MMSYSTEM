const fs = require('fs');
let content = fs.readFileSync('src/context/RestaurantContext.tsx', 'utf8');

content = content.replace(/import \{ createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut \} from 'firebase\/auth';/, "import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithCustomToken, signOut } from 'firebase/auth';");

content = content.replace(/try \{\n\s*const authRes = await fetch\('\/api\/auth\/login', \{\n\s*method: 'POST',\n\s*headers: \{ 'Content-Type': 'application\/json' \},\n\s*body: JSON\.stringify\(\{ username, password, isSuperuserPortal \}\)\n\s*\}\);\n\s*if \(authRes\.ok\) \{\n\s*const resData = await authRes\.json\(\);\n\s*if \(resData\.success && resData\.user\) \{\n\s*serverUser = resData\.user;\n\s*\}\n\s*\}\n\s*\} catch \(err\) \{\n\s*console\.warn\("Server auth endpoint unreachable:", err\);\n\s*\}/m, `let serverCustomToken = null;
    try {
      const authRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, isSuperuserPortal })
      });
      if (authRes.ok) {
        const resData = await authRes.json();
        if (resData.success && resData.user) {
          serverUser = resData.user;
          if (resData.customToken) {
            serverCustomToken = resData.customToken;
          }
        }
      }
    } catch (err) {
      console.warn("Server auth endpoint unreachable:", err);
    }`);

content = content.replace(/let firebaseUserObj = null;\n\s*if \(loginEmail\.includes\('@'\)\) \{/m, `let firebaseUserObj = null;
    if (serverCustomToken) {
      try {
        await signInWithCustomToken(auth, serverCustomToken);
        firebaseUserObj = serverUser;
      } catch (e) {
        console.warn("Failed to sign in with custom token", e);
      }
    } else if (loginEmail.includes('@')) {`);

fs.writeFileSync('src/context/RestaurantContext.tsx', content);
