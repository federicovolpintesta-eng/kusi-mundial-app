const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Set viewport to 1080p landscape
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 2, // Retina quality
  });

  const filePath = 'file://' + path.resolve(__dirname, 'totem_empleados.html');
  await page.goto(filePath, { waitUntil: 'networkidle0' });

  await page.screenshot({
    path: '/Users/federicovolpintesta/Desktop/Totem_Empleados_TV.png',
    fullPage: false,
    omitBackground: false
  });

  await browser.close();
  console.log('PNG de empleados generado exitosamente!');
})();
