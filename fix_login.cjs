const fs = require('fs');
let code = fs.readFileSync('src/context/RestaurantContext.tsx', 'utf8');

const hashFunc = `
// Client-side SHA-256 for basic password hashing fallback
const hashPassword = async (password: string) => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
`;

// Inject hash function before context creation
code = code.replace('const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);', hashFunc + '\nconst RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);');

const oldLoginFallback = `           if (!snap.empty) {
               const docUser = snap.docs[0].data();
               if (docUser.password === password) {
                   finalUser = docUser;
               }
           }`;

const newLoginFallback = `           if (!snap.empty) {
               const docUser = snap.docs[0].data();
               const hashedInput = await hashPassword(password);
               // Allow legacy plaintext match (for migration) or hashed match
               if (docUser.password === password || docUser.password === hashedInput) {
                   finalUser = docUser;
                   // Self-heal: If password was stored in plaintext, upgrade it to hashed
                   if (docUser.password === password) {
                       try {
                           const { doc, updateDoc } = await import('firebase/firestore');
                           await updateDoc(doc(db, 'users', docUser.id), { password: hashedInput });
                       } catch(err) {
                           console.warn("Could not upgrade password hash", err);
                       }
                   }
               }
           }`;

code = code.replace(oldLoginFallback, newLoginFallback);

const oldLocalFallback = `      const localFallbackUser = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
      if (localFallbackUser && localFallbackUser.password === password) {`;

const newLocalFallback = `      const localFallbackUser = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
      const hashedPass = await hashPassword(password);
      if (localFallbackUser && (localFallbackUser.password === password || localFallbackUser.password === hashedPass)) {`;

code = code.replace(oldLocalFallback, newLocalFallback);


const oldRegisterUserPass = `    const newUser: User = {
      ...user,
      id: uid,
      permissions: user.permissions || permissions,
      tenantId: currentUser?.tenantId || 'global'
    };`;

const newRegisterUserPass = `    const newUser: User = {
      ...user,
      id: uid,
      password: user.password ? await hashPassword(user.password) : undefined,
      permissions: user.permissions || permissions,
      tenantId: currentUser?.tenantId || 'global'
    };`;

code = code.replace(oldRegisterUserPass, newRegisterUserPass);

fs.writeFileSync('src/context/RestaurantContext.tsx', code);
