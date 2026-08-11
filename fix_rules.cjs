const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

rules = rules.replace(/request\.auth\.token\.email == 'nick31\.N3@gmail\.com'/, "request.auth.token.email == 'nick31.N3@gmail.com' || request.auth.token.email == 'nick31.n3@gmail.com'");

fs.writeFileSync('firestore.rules', rules);
