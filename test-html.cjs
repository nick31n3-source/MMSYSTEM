const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  await page.type('#username', 'nick31.N3@gmail.com');
  await page.type('#password', 'password');
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 4000));
  
  const html = await page.content();
  fs.writeFileSync('current-page.html', html);
  
  await browser.close();
})();
