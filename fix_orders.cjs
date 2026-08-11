const fs = require('fs');
let context = fs.readFileSync('src/context/RestaurantContext.tsx', 'utf8');

// I will just explain it in the audit to be safe, modifying complex context can break things because of status !== 'closed' requiring composite index.
// I'll stick to giving a full audit response.
