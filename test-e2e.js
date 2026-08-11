import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  
  // Click Superuser portal tab
  await page.waitForFunction(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const suBtn = btns.find(b => b.innerText && b.innerText.includes('Acesso Superusuario'));
    if (suBtn) { suBtn.click(); return true; }
    return false;
  });
  
  // Login
  await page.waitForSelector('#username');
  
  // Wait a tiny bit for transition
  await new Promise(r => setTimeout(r, 500));
  
  // clear input and type
  await page.evaluate(() => document.getElementById('username').value = '');
  await page.type('#username', 'nick31.N3@gmail.com');
  
  await page.evaluate(() => document.getElementById('password').value = '');
  await page.type('#password', 'password');
  
  await page.click('button[type="submit"]');
  
  // Wait for dashboard to load
  await page.waitForFunction(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.innerText && b.innerText.includes('GERENCIAR CLIENTES'));
  }, {timeout: 10000});
  
  console.log("Logged in as Superuser!");
  
  // Add a new client
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText && b.innerText.includes('NOVO CLIENTE'));
    if (btn) btn.click();
  });
  
  await page.waitForSelector('input[placeholder="Ex: Pizzaria Bella Napoli"]', {timeout: 5000});
  await page.type('input[placeholder="Ex: Pizzaria Bella Napoli"]', 'Test Client');
  
  await page.click('button[type="submit"]');
  console.log("Client created!");
  
  await browser.close();
})();
