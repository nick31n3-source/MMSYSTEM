const fs = require('fs');
let code = fs.readFileSync('src/context/RestaurantContext.tsx', 'utf8');

const settingsListener = `
    const unsubTenantSettings = onSnapshot(doc(db, 'tenantSettings', tenantId), (docSnap) => {
      if (docSnap.exists()) {
        setTenantSettings(docSnap.data() as TenantSettings);
      } else {
        setTenantSettings({
          id: tenantId,
          restaurantName: 'MM Systems',
          receiptMessage: 'Obrigado pela preferência!'
        });
      }
    });
`;

code = code.replace(/const unsubTables = onSnapshot/, settingsListener + "\n    const unsubTables = onSnapshot");

code = code.replace(/return \(\) => \{/, `return () => {
      unsubTenantSettings();`);

const updateFn = `
  const updateTenantSettings = (settings: Partial<TenantSettings>) => {
    if (!currentUser) return;
    const tenantId = currentUser.tenantId || 'global';
    setDoc(doc(db, 'tenantSettings', tenantId), { ...tenantSettings, ...settings, id: tenantId }, { merge: true }).catch(console.error);
    addAuditLog('TENANT_SETTINGS_UPDATED', \`Configurações do cliente atualizadas\`);
  };
`;

// Insert the updateFn before updateOrderStatus
code = code.replace(/  const updateOrderStatus/, updateFn + "\n  const updateOrderStatus");

// Add `tenantSettings, updateTenantSettings,` to the provided values
code = code.replace(/<RestaurantContext\.Provider value=\{\{/, `<RestaurantContext.Provider value={{
      tenantSettings, updateTenantSettings,`);

fs.writeFileSync('src/context/RestaurantContext.tsx', code);
