const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf8');

const targetStr = `    } else {
      if (username.trim().toLowerCase() === 'nick31' || username.trim().toLowerCase() === 'superuser') {
        setErrorMsg('Acesso administrativo restrito. Contas administrativas devem realizar login atraves do portal de superusuario.');
        return;
      }
    }`;

code = code.replace(targetStr, `    }`);
fs.writeFileSync('src/components/Login.tsx', code);
