const fs = require('fs');
let code = fs.readFileSync('src/components/EmployeesControl.tsx', 'utf8');

code = code.replace(
  "const handleCreateEmployee = (e: React.FormEvent) => {",
  "const handleCreateEmployee = async (e: React.FormEvent) => {"
);

fs.writeFileSync('src/components/EmployeesControl.tsx', code);

// Also need to update interface of registerUser in RestaurantContext.tsx
let ctx = fs.readFileSync('src/context/RestaurantContext.tsx', 'utf8');
ctx = ctx.replace(
  "registerUser: (user: Omit<User, 'id'>) => { success: boolean; error?: string };",
  "registerUser: (user: Omit<User, 'id'>) => Promise<{ success: boolean; error?: string }>;"
);
fs.writeFileSync('src/context/RestaurantContext.tsx', ctx);
