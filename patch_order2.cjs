const fs = require('fs');
let code = fs.readFileSync('src/context/RestaurantContext.tsx', 'utf8');

code = code.replace(
  "    batch.update(doc(db, 'orders', orderId), { status: 'closed', paymentMethod, totalAmount: Number(finalTotalAmount.toFixed(2)), updatedAt: new Date().toISOString() });",
  "    batch.update(doc(db, 'orders', orderId), cleanUndefined({ status: 'closed', paymentMethod, totalAmount: Number(finalTotalAmount.toFixed(2)), updatedAt: new Date().toISOString() }));"
);

code = code.replace(
  "          batch.update(doc(db, 'orders', o.id), { status: 'closed' });",
  "          batch.update(doc(db, 'orders', o.id), cleanUndefined({ status: 'closed' }));"
);

code = code.replace(
  "    await updateDoc(doc(db, 'orders', orderId), { status, updatedAt: new Date().toISOString() });",
  "    await updateDoc(doc(db, 'orders', orderId), cleanUndefined({ status, updatedAt: new Date().toISOString() }));"
);

fs.writeFileSync('src/context/RestaurantContext.tsx', code);
