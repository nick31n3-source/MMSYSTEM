const fs = require('fs');
let code = fs.readFileSync('src/context/RestaurantContext.tsx', 'utf8');

code = code.replace(
  "    batch.update(doc(db, 'orders', orderId), {\n      items: updatedItems,\n      totalAmount: Number(newTotal.toFixed(2)),\n      status: hasNewNonBeverage ? 'pending' : order.status,\n      updatedAt: new Date().toISOString()\n    });",
  "    batch.update(doc(db, 'orders', orderId), cleanUndefined({\n      items: updatedItems,\n      totalAmount: Number(newTotal.toFixed(2)),\n      status: hasNewNonBeverage ? 'pending' : order.status,\n      updatedAt: new Date().toISOString()\n    }));"
);

fs.writeFileSync('src/context/RestaurantContext.tsx', code);
