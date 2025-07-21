const puppeteer = require('puppeteer');

module.exports = async function startAternos() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();

  try {
    await page.goto('https://aternos.org/go/', { waitUntil: 'networkidle2' });
    await page.goto('https://aternos.org/login/', { waitUntil: 'networkidle2' });

    await page.waitForSelector('input[name="user"]');
    await page.type('input[name="user"]', process.env.ATERNOS_EMAIL);
    await page.type('input[name="password"]', process.env.ATERNOS_PASSWORD);

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);

    if (!page.url().includes('/servers')) {
      throw new Error('❌ Ошибка входа в Aternos. Проверь логин и пароль.');
    }

    await page.goto('https://aternos.org/servers/', { waitUntil: 'networkidle2' });

    const [serverBtn] = await page.$x("//a[contains(@class, 'server-button')]");
    if (!serverBtn) throw new Error('❌ Кнопка сервера не найдена.');
    await serverBtn.click();

    await page.waitForSelector('button.start');

    const isRunning = await page.$('button.start[disabled]');
    if (isRunning) {
      await browser.close();
      return '✅ Сервер уже запущен!';
    }

    await page.click('button.start');
    await page.waitForTimeout(3000);

    await browser.close();
    return '✅ Запрос на запуск сервера отправлен!';
  } catch (err) {
    await browser.close();
    throw err;
  }
};
