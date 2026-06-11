const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Use absolute path for file:// protocol
  const filePath = 'file://' + path.resolve(__dirname, 'totem.html');
  await page.goto(filePath, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: '/Users/federicovolpintesta/Desktop/Totem_Kusi_Mundial.pdf',
    format: 'A4',
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 }
  });

  await browser.close();
  console.log('PDF generado exitosamente!');
})();
