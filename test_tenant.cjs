const fs = require('fs');
let code = fs.readFileSync('src/context/RestaurantContext.tsx', 'utf8');
console.log(code.includes('tenantSettings'));
