const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to mobile to simulate a phone layout for the fixture
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  
  try {
    // Go to the home page, set local storage, then go to fixture
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.setItem('kusi_guest', JSON.stringify({ nombre: 'Test', apellido: 'User', dni: '123', habitacion: '101' }));
    });
    
    await page.goto('http://localhost:3000/fixture', { waitUntil: 'networkidle0' });
    
    // Take full page screenshot
    await page.screenshot({ path: 'screenshot.png', fullPage: true });
    console.log('Screenshot saved to screenshot.png');
  } catch (e) {
    console.error('Error taking screenshot:', e);
  } finally {
    await browser.close();
  }
})();
