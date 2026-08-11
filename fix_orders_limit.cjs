const fs = require('fs');
let code = fs.readFileSync('src/context/RestaurantContext.tsx', 'utf8');

// Change: const unsubOrders = onSnapshot(getQuery('orders'), (snap) => setOrders(snap.docs.map(d => d.data() as Order)));
// To: const unsubOrders = onSnapshot(getQuery('orders', 300), (snap) => setOrders(snap.docs.map(d => d.data() as Order)));

code = code.replace(
  "const unsubOrders = onSnapshot(getQuery('orders'), (snap) => setOrders(snap.docs.map(d => d.data() as Order)));",
  "const unsubOrders = onSnapshot(getQuery('orders', 300), (snap) => setOrders(snap.docs.map(d => d.data() as Order)));"
);

fs.writeFileSync('src/context/RestaurantContext.tsx', code);
