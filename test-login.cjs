const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://localhost:3000');
  
  // Login
  await page.waitForSelector('#username');
  await page.type('#username', 'nick31.N3@gmail.com');
  await page.type('#password', 'password');
  await page.click('button[type="submit"]');
  
  try {
    await page.waitForFunction(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.some(b => b.innerText && b.innerText.includes('CONTROLE DE ESTOQUE'));
    }, { timeout: 10000 });
    console.log('Login successful, dashboard loaded.');
  } catch (err) {
    console.log('Timeout waiting for dashboard. Current HTML:');
    const html = await page.content();
    console.log(html.substring(0, 500) + '... (truncated)');
  }
  
  await browser.close();
})();
