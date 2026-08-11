const fs = require('fs');
let code = fs.readFileSync('src/context/RestaurantContext.tsx', 'utf8');

code = code.replace(
  "      tenantId: currentUser?.tenantId\n    };\n    setDoc(doc(db, 'users', newUser.id)",
  "      tenantId: currentUser?.tenantId || 'global'\n    };\n    setDoc(doc(db, 'users', newUser.id)"
);

fs.writeFileSync('src/context/RestaurantContext.tsx', code);
