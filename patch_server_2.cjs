const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const apiEndpoints = `
  // IP Management APIs (only superuser can manage)
  app.get("/api/superuser/ips", async (req, res) => {
    if (!req.userEmail || req.userEmail !== "nick31.N3@gmail.com") return res.status(403).json({ success: false, error: "Unauthorized" });
    const targetId = req.query.targetTenantId as string;
    const ips = await getAccountIps(targetId);
    res.json({ success: true, ips });
  });

  app.post("/api/superuser/ips", async (req, res) => {
    if (!req.userEmail || req.userEmail !== "nick31.N3@gmail.com") return res.status(403).json({ success: false, error: "Unauthorized" });
    const { targetTenantId, ip } = req.body;
    await addAccountIp(targetTenantId, ip);
    res.json({ success: true });
  });

  app.delete("/api/superuser/ips", async (req, res) => {
    if (!req.userEmail || req.userEmail !== "nick31.N3@gmail.com") return res.status(403).json({ success: false, error: "Unauthorized" });
    const { targetTenantId, ip } = req.body;
    await removeAccountIp(targetTenantId, ip);
    res.json({ success: true });
  });

  app.post("/api/db-test", (req, res) => {
`;

code = code.replace('  app.post("/api/db-test", (req, res) => {', apiEndpoints);
fs.writeFileSync('server.ts', code);
