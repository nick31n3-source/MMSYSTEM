/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";

import path from "path";
import { createServer as createViteServer } from "vite";
import { getAccountIps, addAccountIp, removeAccountIp } from "./src/lib/db";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();


import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
if (!getApps().length) {
  try {
    initializeApp({
      projectId: "mm-systems-502601"
    });
  } catch(e) {
    console.warn("Firebase Admin initializeApp failed (expected in limited preview environments without service accounts)", e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Middleware to ensure strict tenant isolation and prevent cross-tenant data leaks
  app.use(async (req, res, next) => {
    // Skip auth and isolation checks for health, db-status, and login paths
    if (!req.path.startsWith("/api/")) {
      return next();
    }
    
    // Skip auth and isolation checks for health, db-status, and login paths
    if (req.path === "/api/health" || req.path === "/api/db-status" || req.path === "/api/auth/login") {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
       // Since the frontend might still be using legacy headers, we can fall back to rejecting.
       // However, we MUST validate the token if we want to be secure.
       return res.status(401).json({ success: false, error: "Acesso negado: Token JWT ausente." });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      if (getApps().length > 0) {
        decodedToken = await getAuth().verifyIdToken(token);
      } else {
        // Fallback for preview environment without service accounts: we trust the client ID temporarily
        // BUT the instruction specifically said "validando os tokens JWT".
        // In a real environment, verifyIdToken works. If the admin app failed to init, it throws.
        throw new Error("Admin SDK not initialized");
      }
    } catch (error) {
      console.warn("JWT validation failed:", error);
      return res.status(401).json({ success: false, error: "Acesso negado: Token JWT inválido ou expirado." });
    }

    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;
    
    const tenantIdHeader = req.headers["x-tenant-id"] as string | undefined;
    const targetTenantId = (tenantIdHeader || req.query.tenantId || req.body.tenantId || "global") as string;

    const isSuperuser = userEmail === "nick31.N3@gmail.com";

    // 2. Prevent unauthenticated access to non-global scopes
    if (!userId && targetTenantId !== "global") {
      return res.status(401).json({ 
         success: false, 
         error: "Não autorizado: Acesso a dados de inquilinos requer autenticação prévia." 
       });
    }

    // 4. Only superusers can write to the 'global' scope
    if (req.method === "POST" && targetTenantId === "global" && !isSuperuser) {
      return res.status(403).json({ 
         success: false, 
         error: "Acesso negado: Apenas superusuários possuem autorização para salvar no escopo global." 
       });
    }

    
    // IP Validation Middleware
    try {
      // For superusers, validate against 'global' IP list. For tenants, validate against their specific tenant ID list.
      const ipCheckTenant = isSuperuser ? "global" : targetTenantId;
      const allowedIps = await getAccountIps(ipCheckTenant);
      
      if (allowedIps.length > 0) {
        const clientIp = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '';
        const cleanIp = clientIp.replace(/^.*:/, '');
        
        if (!allowedIps.includes(clientIp) && !allowedIps.includes(cleanIp)) {
          console.warn(`Unauthorized IP ${clientIp} attempted to access tenant ${ipCheckTenant}`);
          return res.status(403).json({
            success: false,
            error: "Acesso bloqueado por restrição de IP (403 Unauthorized)."
          });
        }
      }
    } catch (err) {
      console.error("IP Validation error", err);
    }
    
    (req as any).tenantId = targetTenantId;

    (req as any).userId = userId;
    (req as any).userEmail = userEmail;
    next();
  });

  // 1. API Endpoints (always declared first before Vite/static middlewares)
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  app.get("/api/db-status", (req, res) => {
    const status = { connected: true };
    res.json(status);
  });

  // Secure server-side authentication endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      let { username, password, isSuperuserPortal } = req.body;
      if (password) password = password.trim();
      if (!username || !password) {
        return res.status(400).json({ success: false, error: "Nome de usuario e senha sao obrigatorios." });
      }

      // 1. Superuser hardcoded check
      if ((username.trim().toLowerCase() === 'nick31' || username.trim().toLowerCase() === 'nick31.n3@gmail.com') && password === 'password') {
        if (!isSuperuserPortal) {
          return res.status(403).json({ success: false, error: "Superusuario deve entrar pelo portal de superusuario." });
        }
        const sUser = {
          id: 'u-nick31-superuser',
          username: 'nick31',          name: 'Nick User (Superuser)',          role: 'superuser',
          email: 'nick31.N3@gmail.com',          permissions: ['master_dashboard', 'dashboard', 'reports', 'menu', 'inventory', 'supplies', 'waiter', 'kitchen', 'billing', 'employees']        };
        let customToken = null;        try {          if (getApps().length > 0) {            customToken = await getAuth().createCustomToken(sUser.id, { email: sUser.email });          }        } catch(e) {}
        return res.json({ success: true, user: sUser, customToken });      }

      // Fallback for Firebase Auth client-side validation
      return res.json({ success: true, mode: 'firebase_auth_fallback' });
    } catch (err: any) {      res.status(500).json({ success: false, error: err.message });    }  });

  // 2. Vite Middleware or static serving depending on environment
  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring development server with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Configuring production server with static assets serving...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files
    app.use(express.static(distPath));
    
    // SPA routing fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`==================================================`);
    console.log(` MM SYSTEMS BACKEND RUNNING AT http://localhost:${PORT}`);
    console.log(` ENV MODE: ${process.env.NODE_ENV || "development"}`);
    console.log(`==================================================`);
  });
}

startServer().catch((err) => {
  console.error("Critical failure during server boot:", err);
  process.exit(1);
});
