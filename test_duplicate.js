import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:3000');
    // Login as Superuser
    await page.type('#username', 'nick31');
    await page.type('#password', 'password');
    await page.click('button[type="submit"]');
    
    await page.waitForFunction(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.some(b => b.textContent && b.textContent.toUpperCase().includes('GERENCIAMENTO DE CLIENTES'));
    }, {timeout: 10000});

    // We just assume we are on the dashboard
    // Need to trigger the addClient button
    
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
