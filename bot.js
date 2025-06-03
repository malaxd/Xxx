const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const cookies = JSON.parse(fs.readFileSync('./cookies.json', 'utf8'));
  const playlistUrl = 'https://m.youtube.com/playlist?list=PLQW2KPwHlCcQRoM5GXYgUTFqKJgs3ImfV';

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Załaduj cookies
  await page.setCookie(...cookies);

  // Otwórz playlistę
  await page.goto(playlistUrl, { waitUntil: 'networkidle2' });

  // Pobierz linki do wszystkich piosenek na playliście
  const links = await page.$$eval('a[href*="/watch"]', anchors =>
    anchors.map(a => a.href).filter((v, i, a) => a.indexOf(v) === i) // unikalne
  );

  console.log(`Znaleziono ${links.length} piosenek na playliście.`);

  // Przejdź do kolejki Media Requests w StreamElements
  await page.goto('https://streamelements.com/songrequest/queue', { waitUntil: 'networkidle2' });

  for (const link of links) {
    // Wpisz link i zatwierdź
    await page.type('#media-request-input', link);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
  }

  console.log('Wszystkie piosenki zostały dodane do kolejki.');

  await browser.close();
})();