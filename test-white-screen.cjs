const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  const response = await page.goto('http://localhost:3000');
  console.log('HTTP Status:', response.status());
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const html = await page.content();
  console.log('HTML Length:', html.length);
  if (html.length < 1000) {
      console.log('HTML CONTENT:', html);
  }
  
  await browser.close();
})();
