const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

const interceptor = `
    if (url.startsWith('/api/') && !url.startsWith('/api/auth/login') && !url.startsWith('/api/health') && !url.startsWith('/api/db-status')) {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      let res;
      if (input instanceof Request) {
        const newHeaders = new Headers(input.headers);
        if (token) {
          newHeaders.set('Authorization', \`Bearer \${token}\`);
        }
        const newRequest = new Request(input, { headers: newHeaders });
        res = await originalFetch(newRequest, init);
      } else {
        const newInit = { ...init };
        newInit.headers = new Headers(newInit.headers || {});
        if (token) {
          newInit.headers.set('Authorization', \`Bearer \${token}\`);
        }
        res = await originalFetch(input, newInit);
      }
      
      if (res.status === 403) {
        window.dispatchEvent(new CustomEvent('ip-blocked'));
      }
      return res;
    }
`;

code = code.replace(/    if \(url\.startsWith\('\/api\/'\)[\s\S]*?return originalFetch\(input, init\);\n  }/, interceptor + "\n    return originalFetch(input, init);\n  }");
fs.writeFileSync('src/main.tsx', code);
