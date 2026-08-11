const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  
  await page.waitForFunction(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const suBtn = btns.find(b => b.textContent && b.textContent.toUpperCase().includes('ACESSO SUPERUSUARIO'));
    if (suBtn) { suBtn.click(); return true; }
    return false;
  });
  
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => document.getElementById('username').value = '');
  await page.type('#username', 'nick31');
  await page.evaluate(() => document.getElementById('password').value = '');
  await page.type('#password', 'password');
  await page.click('button[type="submit"]');
  
  await page.waitForFunction(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.textContent && b.textContent.toUpperCase().includes('GERENCIAMENTO DE CLIENTES'));
  }, {timeout: 10000});
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.toUpperCase().includes('ADICIONAR CLIENTE'));
    if (btn) btn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  const html = await page.content();
  fs.writeFileSync('modal.html', html);
  
  await browser.close();
})();
