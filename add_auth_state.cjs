const fs = require('fs');
let content = fs.readFileSync('src/context/RestaurantContext.tsx', 'utf8');

const regex = /const \[hasLoadedTenantData, setHasLoadedTenantData\] = useState\(false\);/m;
const replacement = `const [hasLoadedTenantData, setHasLoadedTenantData] = useState(false);

  // Restore Firebase Auth session on page reload
  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser && !currentUser) {
        try {
          const usersSnap = await getDocs(collection(db, 'users'));
          let foundUser = null;
          usersSnap.forEach(doc => {
            const data = doc.data();
            if (data.email && data.email.toLowerCase() === firebaseUser.email?.toLowerCase()) {
              foundUser = data;
            }
          });
          if (foundUser) {
            setCurrentUser(sanitizeUsers([foundUser])[0]);
          }
        } catch(e) {
          console.error("Error restoring session:", e);
        }
      }
    });
    return () => unsubAuth();
  }, [currentUser]);`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/context/RestaurantContext.tsx', content);
