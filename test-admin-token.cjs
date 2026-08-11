const { initializeApp, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

initializeApp({ projectId: "mm-systems-502601" });
console.log(getApps().length);

(async () => {
  try {
    const token = await getAuth().createCustomToken('test', { tenantId: '123' });
    console.log('Token:', token);
  } catch(e) {
    console.log('Error:', e.message);
  }
})();
