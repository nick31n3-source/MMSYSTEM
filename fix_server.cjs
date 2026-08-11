const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

// The login route shouldn't depend on getAllSyncPayloads since that sync payload system was removed.
// I will strip out the external DB payload check in login, keeping just the superuser and falling back.

let loginRoute = `
  // Secure server-side authentication endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      let { username, password, isSuperuserPortal } = req.body;
      if (password) password = password.trim();
      if (!username || !password) {
        return res.status(400).json({ success: false, error: "Nome de usuario e senha sao obrigatorios." });
      }

      // 1. Superuser hardcoded check
      if ((username.trim().toLowerCase() === 'nick31' || username.trim().toLowerCase() === 'nick31.n3@gmail.com') && password === 'password') {
        if (!isSuperuserPortal) {
          return res.status(403).json({ success: false, error: "Superusuario deve entrar pelo portal de superusuario." });
        }
        const sUser = {
          id: 'u-nick31-superuser',
          username: 'nick31',          name: 'Nick User (Superuser)',          role: 'superuser',
          email: 'nick31.N3@gmail.com',          permissions: ['master_dashboard', 'dashboard', 'reports', 'menu', 'inventory', 'supplies', 'waiter', 'kitchen', 'billing', 'employees']        };
        let customToken = null;        try {          if (getApps().length > 0) {            customToken = await getAuth().createCustomToken(sUser.id, { email: sUser.email });          }        } catch(e) {}
        return res.json({ success: true, user: sUser, customToken });      }

      // Fallback for Firebase Auth client-side validation
      return res.json({ success: true, mode: 'firebase_auth_fallback' });
    } catch (err: any) {      res.status(500).json({ success: false, error: err.message });    }  });
`;

server = server.replace(/\/\/ Secure server-side authentication endpoint[\s\S]*?\/\/ 2\. Vite Middleware/m, loginRoute + '\n  // 2. Vite Middleware');

server = server.replace(/import { getAccountIps, addAccountIp, removeAccountIp } from "\.\/src\/lib\/db";/g, 'import { getAccountIps, addAccountIp, removeAccountIp } from "./src/lib/db";');

fs.writeFileSync('server.ts', server);
