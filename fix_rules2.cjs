const fs = require('fs');

const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }

    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isSuperuser() {
      return isAuthenticated() && (request.auth.token.email == 'nick31.N3@gmail.com' || request.auth.token.email == 'nick31.n3@gmail.com');
    }

    function getUserTenantId() {
      let userDoc = get(/databases/$(database)/documents/users/$(request.auth.uid));
      return userDoc != null ? userDoc.data.tenantId : 'global';
    }

    function isTenantResource() {
      let uTenant = getUserTenantId();
      return (uTenant != null && (resource == null || resource.data.tenantId == uTenant) && (request.resource == null || request.resource.data.tenantId == uTenant)) || ((resource == null || resource.data.tenantId == 'global') && (request.resource == null || request.resource.data.tenantId == 'global'));
    }

    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isSuperuser() || isAuthenticated(); 
      allow update, delete: if isSuperuser() || request.auth.uid == userId;
    }

    match /clientInstances/{clientId} {
      allow read: if isSuperuser();
      allow create: if isSuperuser() || true; // Setup needs to create instances
      allow update, delete: if isSuperuser();
    }

    // Tenant-isolated collections
    match /menu/{item} {
      allow read, write: if isAuthenticated() && (isSuperuser() || isTenantResource());
    }

    match /inventory/{item} {
      allow read, write: if isAuthenticated() && (isSuperuser() || isTenantResource());
    }

    match /orders/{item} {
      allow read, write: if isAuthenticated() && (isSuperuser() || isTenantResource());
    }

    match /sales/{item} {
      allow read, write: if isAuthenticated() && (isSuperuser() || isTenantResource());
    }

    match /tables/{item} {
      allow read, write: if isAuthenticated() && (isSuperuser() || isTenantResource());
    }

    match /suppliers/{item} {
      allow read, write: if isAuthenticated() && (isSuperuser() || isTenantResource());
    }

    match /supplyOrders/{item} {
      allow read, write: if isAuthenticated() && (isSuperuser() || isTenantResource());
    }

    match /auditLogs/{item} {
      allow read, write: if isAuthenticated() && (isSuperuser() || isTenantResource());
    }
  }
}
`;
fs.writeFileSync('firestore.rules', rules);
