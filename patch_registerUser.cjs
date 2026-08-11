const fs = require('fs');
let code = fs.readFileSync('src/context/RestaurantContext.tsx', 'utf8');

const replacement = `  const registerUser = async (user: Omit<User, 'id'>) => {
    // Check locally first
    const existsLocally = users.some(u => u.username.toLowerCase() === user.username.trim().toLowerCase());
    if (existsLocally) {
      return { success: false, error: 'Este nome de usuário já está cadastrado nesta instância.' };
    }
    
    // Check globally to prevent login conflicts
    try {
      const q = query(collection(db, 'users'), where('username', '==', user.username.trim().toLowerCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return { success: false, error: 'Este nome de usuário já está sendo utilizado globalmente. Escolha outro.' };
      }
      if (user.email) {
        const qEmail = query(collection(db, 'users'), where('email', '==', user.email.trim().toLowerCase()));
        const snapEmail = await getDocs(qEmail);
        if (!snapEmail.empty) {
          return { success: false, error: 'Este email já está sendo utilizado globalmente. Escolha outro.' };
        }
      }
    } catch(e) {
      console.warn("Global duplication check failed (might be permissions), continuing...", e);
    }
`;

code = code.replace(
  "  const registerUser = (user: Omit<User, 'id'>) => {\n    const exists = users.some(u => u.username.toLowerCase() === user.username.trim().toLowerCase());\n    if (exists) {\n      return { success: false, error: 'Este nome de usuário já está cadastrado.' };\n    }",
  replacement
);

fs.writeFileSync('src/context/RestaurantContext.tsx', code);

// Patch EmployeesControl
let empCode = fs.readFileSync('src/components/EmployeesControl.tsx', 'utf8');
empCode = empCode.replace(
  "const res = registerUser({",
  "const res = await registerUser({"
);
fs.writeFileSync('src/components/EmployeesControl.tsx', empCode);
