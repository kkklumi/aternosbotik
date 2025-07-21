const puppeteer = require('puppeteer');

module.exports = async function startAternos() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    await page.goto('https://aternos.org/go/', { waitUntil: 'networkidle2' });
    await page.type('#user', process.env.ATERNOS_EMAIL);
    await page.type('#password', process.env.ATERNOS_PASSWORD);
    await Promise.all([
      page.click('#login'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);

    if (!page.url().includes('/server/')) {
      throw new Error('Ошибка входа в Aternos. Проверь логин и пароль.');
    }

    await page.goto('https://aternos.org/server/');
    await page.waitForSelector('.server-status.online, .server-status.offline', { timeout: 10000 });

    const isOnline = await page.$('.server-status.online');
    if (isOnline) {
      await browser.close();
      return '✅ Сервер уже запущен!';
    }

    const startButton = await page.$('button.btn.btn-success.btn-xs');
    if (!startButton) throw new Error('Кнопка запуска не найдена.');

    await startButton.click();
    await browser.close();
    return '✅ Запрос на запуск сервера отправлен!';
  } catch (err) {
    await browser.close();
    throw err;
  }
};
