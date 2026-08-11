const fs = require('fs');
let content = fs.readFileSync('src/context/RestaurantContext.tsx.new', 'utf8');

const tIdStr = "tenantId: currentUser?.tenantId || 'global'";

// Helper to replace function body
function replaceFunc(content, funcName, oldBodyRegex, newBody) {
    return content.replace(oldBodyRegex, newBody);
}

content = content.replace(
  /const addMenuItem = \(item: Omit<MenuItem, 'id'>\) => \{[\s\S]*?addAuditLog[\s\S]*?\};/,
  `const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: \`menu-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`,
      ${tIdStr}
    } as any;
    await setDoc(doc(db, 'menu', newItem.id), newItem);
    addAuditLog('MENU_ITEM_ADDED', \`Novo item adicionado ao cardápio: \${item.name}\`);
  };`
);

content = content.replace(
  /const updateMenuItem = \(item: MenuItem\) => \{[\s\S]*?addAuditLog[\s\S]*?\};/,
  `const updateMenuItem = async (item: MenuItem) => {
    await updateDoc(doc(db, 'menu', item.id), item as any);
    addAuditLog('MENU_ITEM_UPDATED', \`Item do cardápio atualizado: \${item.name}\`);
  };`
);

content = content.replace(
  /const toggleMenuItemActive = \(id: string\) => \{[\s\S]*?\};/,
  `const toggleMenuItemActive = async (id: string) => {
    const item = menu.find(m => m.id === id);
    if (item) {
      await updateDoc(doc(db, 'menu', id), { isActive: !item.isActive });
    }
  };`
);

content = content.replace(
  /const deleteMenuItem = \(id: string\) => \{[\s\S]*?addAuditLog[\s\S]*?\};/,
  `const deleteMenuItem = async (id: string) => {
    await deleteDoc(doc(db, 'menu', id));
    addAuditLog('MENU_ITEM_DELETED', \`Item removido do cardápio: ID \${id}\`);
  };`
);

content = content.replace(
  /const addIngredient = \(ingredient: Omit<Ingredient, 'id'>\) => \{[\s\S]*?setInventory[\s\S]*?\};/,
  `const addIngredient = async (ingredient: Omit<Ingredient, 'id'>) => {
    const newIng = {
      ...ingredient,
      id: \`ing-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`,
      ${tIdStr}
    };
    await setDoc(doc(db, 'inventory', newIng.id), newIng);
  };`
);

content = content.replace(
  /const updateIngredient = \(ingredient: Ingredient\) => \{[\s\S]*?setInventory[\s\S]*?\};/,
  `const updateIngredient = async (ingredient: Ingredient) => {
    await updateDoc(doc(db, 'inventory', ingredient.id), ingredient as any);
  };`
);

content = content.replace(
  /const deleteIngredient = \(id: string\) => \{[\s\S]*?setMenu[\s\S]*?\}\)\)\);\n  \};/,
  `const deleteIngredient = async (id: string) => {
    await deleteDoc(doc(db, 'inventory', id));
    // Remove ingredient from recipes
    const batch = writeBatch(db);
    menu.forEach(m => {
      if (m.ingredients.some(recipe => recipe.ingredientId === id)) {
        batch.update(doc(db, 'menu', m.id), {
          ingredients: m.ingredients.filter(recipe => recipe.ingredientId !== id)
        });
      }
    });
    await batch.commit();
  };`
);

content = content.replace(
  /const restockIngredient = \(id: string, amount: number\) => \{[\s\S]*?return i;\n    \}\)\);\n  \};/,
  `const restockIngredient = async (id: string, amount: number) => {
    const ingredient = inventory.find(i => i.id === id);
    if (ingredient) {
      await updateDoc(doc(db, 'inventory', id), { quantity: Number((ingredient.quantity + amount).toFixed(2)) });
    }
  };`
);


// createOrder
content = content.replace(
  /    \/\/ Update state synchronously\n    setInventory\(deductionResult.updatedInventory\);\n    setOrders\(prev => \[\.\.\.prev, newOrder\]\);\n    setTables\(prev => prev.map\(t => t.number === tableNumber \? \{ \.\.\.t, status: 'occupied', currentOrderId: orderId \} : t\)\);/g,
  `    const batch = writeBatch(db);
    deductionResult.updatedInventory.forEach(inv => {
      batch.set(doc(db, 'inventory', inv.id), inv);
    });
    batch.set(doc(db, 'orders', newOrder.id), { ...newOrder, ${tIdStr} });
    const table = tables.find(t => t.number === tableNumber);
    if (table) batch.update(doc(db, 'tables', table.id || table.number.toString()), { status: 'occupied', currentOrderId: orderId, ${tIdStr} });
    batch.commit().catch(console.error);`
);


// addItemsToOrder
content = content.replace(
  /    setInventory\(deductionResult.updatedInventory\);\n[\s\S]*?new Date\(\).toISOString\(\),\n    \} : o\)\);/g,
  `    const batch = writeBatch(db);
    deductionResult.updatedInventory.forEach(inv => {
      batch.update(doc(db, 'inventory', inv.id), { quantity: inv.quantity });
    });
    const hasNewNonBeverage = items.some(item => {
      const menuItem = menu.find(m => m.id === item.menuItemId);
      return menuItem && menuItem.category !== 'Beverages';
    });
    batch.update(doc(db, 'orders', orderId), {
      items: updatedItems,
      totalAmount: Number(newTotal.toFixed(2)),
      status: hasNewNonBeverage ? 'pending' : order.status,
      updatedAt: new Date().toISOString()
    });
    batch.commit().catch(console.error);`
);

// updateOrderStatus
content = content.replace(
  /const updateOrderStatus = \(orderId: string, status: OrderStatus\) => \{[\s\S]*?\}\n    \}\n  \};/,
  `const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await updateDoc(doc(db, 'orders', orderId), { status, updatedAt: new Date().toISOString() });
  };`
);

// closeBill
content = content.replace(
  /    \/\/ Close the order[\s\S]*?setTables\([\s\S]*?\);\n/g,
  `    const batch = writeBatch(db);
    batch.update(doc(db, 'orders', orderId), { status: 'closed', paymentMethod, totalAmount: Number(finalTotalAmount.toFixed(2)), updatedAt: new Date().toISOString() });
    batch.set(doc(db, 'sales', newSalesRecord.id), { ...newSalesRecord, ${tIdStr} });
    const table = tables.find(t => t.currentOrderId === orderId);
    if (table) batch.update(doc(db, 'tables', table.id || table.number.toString()), { status: 'available', currentOrderId: null });
    batch.commit().catch(console.error);\n`
);

// suppliers / supplyOrders
content = content.replace(
  /const addSupplier = \(s: Supplier\) => setSuppliers\(prev => \[s, \.\.\.prev\]\);/,
  `const addSupplier = async (s: Supplier) => { await setDoc(doc(db, 'suppliers', s.id), { ...s, ${tIdStr} }); };`
);
content = content.replace(
  /const addSupplyOrder = \(o: SupplyOrder\) => setSupplyOrders\(prev => \[o, \.\.\.prev\]\);/,
  `const addSupplyOrder = async (o: SupplyOrder) => { await setDoc(doc(db, 'supplyOrders', o.id), { ...o, ${tIdStr} }); };`
);
content = content.replace(
  /const updateSupplyOrderStatus = \(orderId: string, status: 'Pendente' \| 'Recebido'\) => \{[\s\S]*?\};\n/,
  `const updateSupplyOrderStatus = async (orderId: string, status: 'Pendente' | 'Recebido') => {
    await updateDoc(doc(db, 'supplyOrders', orderId), { status });
  };\n`
);

// users
content = content.replace(
  /    setUsers\(prev => \[\.\.\.prev, newUser\]\);/,
  `    setDoc(doc(db, 'users', newUser.id), newUser).catch(console.error);`
);
content = content.replace(
  /    setUsers\(prev => prev.map\(u => u.id === userId \? \{ \.\.\.u, permissions \} : u\)\);/,
  `    updateDoc(doc(db, 'users', userId), { permissions }).catch(console.error);`
);
content = content.replace(
  /    setUsers\(prev => prev.filter\(u => u.id !== userId\)\);/,
  `    deleteDoc(doc(db, 'users', userId)).catch(console.error);`
);

// clients
content = content.replace(
  /    const updatedClients = \[\.\.\.clientInstances, newClient\];\n    setClientInstances\(updatedClients\);/,
  `    setDoc(doc(db, 'clientInstances', newClient.id), newClient).catch(console.error);`
);
content = content.replace(
  /      updatedUsers = \[\.\.\.users, newUser\];\n      setUsers\(updatedUsers\);\n      localStorage.setItem\('rest_users', JSON.stringify\(updatedUsers\)\);/,
  `      setDoc(doc(db, 'users', newUser.id), newUser).catch(console.error);`
);

content = content.replace(
  /        return \{\n          \.\.\.c,\n          subscriptionTier: tier,\n          subscriptionStatus: status,\n          subscriptionCost: cost,\n          nextBillingDate\n        \};\n      \}\n      return c;\n    \}\)\);\n  \};/,
  `      updateDoc(doc(db, 'clientInstances', c.id), {
          subscriptionTier: tier,
          subscriptionStatus: status,
          subscriptionCost: cost,
          nextBillingDate
        }).catch(console.error);
      }
      return c;
    }));
  };`
);

content = content.replace(
  /    if \(client\) \{\n      const updatedClients = clientInstances.filter\(c => c.id !== clientId\);\n      setClientInstances\(updatedClients\);\n[\s\S]*?supplyOrders\n      \};\n/,
  `    if (client) {
      deleteDoc(doc(db, 'clientInstances', clientId)).catch(console.error);
      if (client.adminUsername) {
        const u = users.find(u => u.username === client.adminUsername);
        if (u) deleteDoc(doc(db, 'users', u.id)).catch(console.error);
      }
      addAuditLog('CLIENT_DELETED', \`Tenant instance completely purged: "\${client.name}" (\${client.ownerName}).\`, client.id);
`
);

// syncAndCleanOrphans
content = content.replace(
  /  const syncAndCleanOrphans = \(\) => \{[\s\S]*?\}\);\n  \};\n/,
  `  const syncAndCleanOrphans = () => {
    const batch = writeBatch(db);
    tables.forEach(t => {
      if (t.status === 'occupied') {
        const activeOrderForTable = orders.find(o => o.tableNumber === t.number && o.status !== 'closed');
        if (!activeOrderForTable) {
          batch.update(doc(db, 'tables', t.id || t.number.toString()), { status: 'available', currentOrderId: null });
        } else if (t.currentOrderId !== activeOrderForTable.id) {
          batch.update(doc(db, 'tables', t.id || t.number.toString()), { currentOrderId: activeOrderForTable.id });
        }
      }
    });
    orders.forEach(o => {
      if (o.status !== 'closed') {
        const tableExists = tables.find(t => t.number === o.tableNumber);
        if (!tableExists) {
          batch.update(doc(db, 'orders', o.id), { status: 'closed' });
        }
      }
    });
    batch.commit().catch(console.error);
  };\n`
);

// addAuditLog
content = content.replace(
  /    setAuditLogs\(prev => \[newLog, \.\.\.prev\]\);/,
  `    setDoc(doc(db, 'auditLogs', newLog.id), newLog).catch(console.error);`
);


fs.writeFileSync('src/context/RestaurantContext.tsx.new', content);
