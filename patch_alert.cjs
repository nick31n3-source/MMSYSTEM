const fs = require('fs');
let code = fs.readFileSync('src/context/RestaurantContext.tsx', 'utf8');

code = code.replace(
  'alert("Error: A user with this username or email already exists.");',
  '// removed alert'
);

fs.writeFileSync('src/context/RestaurantContext.tsx', code);
