const fs = require('fs');

const standardLogoPath = '<path d="M 20 67 L 20 17 L 50 47 L 80 17 L 80 67 L 65 82 L 65 37 L 50 52 L 35 37 L 35 82 Z" fill="none" stroke="#22d3ee" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />';

const hexLogoPath = '<path d="M 41 55.1 L 41 40.1 L 50 49.1 L 59 40.1 L 59 55.1 L 54.5 59.6 L 54.5 46.1 L 50 50.6 L 45.5 46.1 L 45.5 59.6 Z" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />';

let landingContent = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');
landingContent = landingContent.replace(/<path d="M 25 78[^>]+>\s*<path d="M 35 78[^>]+>/g, standardLogoPath);
landingContent = landingContent.replace(/<path d="M 40 61\.5[^>]+>\s*<path d="M 44 61\.5[^>]+>/g, hexLogoPath);
fs.writeFileSync('src/components/LandingPage.tsx', landingContent);

let loginContent = fs.readFileSync('src/components/Login.tsx', 'utf8');
loginContent = loginContent.replace(/<path d="M 25 78[^>]+>\s*<path d="M 35 78[^>]+>/g, standardLogoPath);
fs.writeFileSync('src/components/Login.tsx', loginContent);

console.log("Done");
