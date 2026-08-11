const fs = require('fs');
let content = fs.readFileSync('src/context/RestaurantContext.tsx', 'utf8');

// Replace addClientInstance
const addClientRegex = /const addClientInstance = \([\s\S]*?addAuditLog[\s\S]*?\}\n  \};/m;
const newAddClient = `const addClientInstance = async (client: Omit<ClientInstance, 'id' | 'createdAt' | 'activeOrdersCount' | 'monthlyRevenue' | 'databaseSizeMB'>) => {
    const newClient: ClientInstance = {
      ...client,
      id: \`client-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`,
      activeOrdersCount: 0,
      monthlyRevenue: 0.0,
      databaseSizeMB: 4.8,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'clientInstances', newClient.id), newClient).catch(console.error);
    addAuditLog('CLIENT_CREATED', \`New tenant instance created: "\${client.name}" (\${client.ownerName}). DB Host: \${client.dbHost}\`, newClient.id);

    // Create corresponding user so they can log in
    if (client.email && client.adminPassword) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, client.email, client.adminPassword);
        const newUser: User = {
          id: userCredential.user.uid,
          username: client.adminUsername ? client.adminUsername.trim() : client.email.split('@')[0],
          password: client.adminPassword, // keep in db as requested before? Wait, the instructions didn't say to remove it but with auth we don't need it. I'll include it just to not break fallback checks if any.
          name: client.ownerName,
          role: 'admin',
          email: client.email,
          permissions: ['dashboard', 'reports', 'menu', 'inventory', 'supplies', 'waiter', 'kitchen', 'billing', 'employees'],
          tenantId: newClient.id
        };
        await setDoc(doc(db, 'users', newUser.id), newUser);
      } catch (error) {
        console.error("Error creating Firebase Auth user:", error);
      }
    }
  };`;

content = content.replace(addClientRegex, newAddClient);


// Replace login function
// Find the exact login function string in the file to replace it.
const loginRegex = /const login = async \(username: string[\s\S]*?return false;\n  \};/m;
const newLogin = `const login = async (username: string, password?: string, isSuperuserPortal = false): Promise<boolean> => {
    // Attempt Firebase Authentication if it looks like an email
    // Or fallback to resolving the username from Firestore first to get the email
    let loginEmail = username.trim();
    if (password) {
      if (!loginEmail.includes('@')) {
        try {
          const usersSnap = await getDocs(collection(db, 'users'));
          usersSnap.forEach(doc => {
            const data = doc.data();
            if (data.username && data.username.toLowerCase() === loginEmail.toLowerCase() && data.email) {
              loginEmail = data.email;
            }
          });
        } catch (e) {
          console.error("Failed to lookup user email by username:", e);
        }
      }
      
      try {
        await signInWithEmailAndPassword(auth, loginEmail, password);
        // If sign in succeeds, fetch user profile from Firestore
        const usersSnap = await getDocs(collection(db, 'users'));
        let foundUser = null;
        usersSnap.forEach(doc => {
          const data = doc.data();
          if (data.email && data.email.toLowerCase() === loginEmail.toLowerCase()) {
            foundUser = data;
          }
        });
        
        if (foundUser) {
          if (foundUser.role === 'superuser' && !isSuperuserPortal) {
            await signOut(auth);
            return false;
          }
          const sanitizedUser = sanitizeUsers([foundUser])[0];
          setCurrentUser(sanitizedUser);
          return true;
        } else {
          // Edge case: logged in but user profile not found in db
          await signOut(auth);
        }
      } catch (e) {
        console.error("Firebase auth login failed:", e);
      }
    }

    // Server-Side Authentication / Local Fallback for superuser
    try {
      const authRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, isSuperuserPortal })
      });
      if (authRes.ok) {
        const resData = await authRes.json();
        if (resData.success && resData.user) {
          const sanitizedUser = sanitizeUsers([resData.user])[0];
          setCurrentUser(sanitizedUser);
          return true;
        }
      }
    } catch (err) {
      console.warn("Server auth endpoint unreachable, falling back to client-side verification:", err);
    }

    // Offline / Hardcoded Superuser Fallback
    if ((username.trim().toLowerCase() === 'nick31' || username.trim().toLowerCase() === 'nick31.n3@gmail.com') && password === 'password') {
      if (!isSuperuserPortal) { return false; }
      const sUser: User = {
        id: 'u-nick31-superuser',
        username: 'nick31',
        name: 'Nick User (Superuser)',
        role: 'superuser',
        email: 'nick31.N3@gmail.com',
        permissions: ['master_dashboard', 'dashboard', 'reports', 'menu', 'inventory', 'supplies', 'waiter', 'kitchen', 'billing', 'employees']
      };
      setCurrentUser(sUser);
      return true;
    }
    
    return false;
  };`;
content = content.replace(loginRegex, newLogin);

fs.writeFileSync('src/context/RestaurantContext.tsx', content);
