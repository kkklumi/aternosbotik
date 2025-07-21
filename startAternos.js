const puppeteer = require('puppeteer');

async function startAternos() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  try {
    // 1. Вход
    await page.goto('https://aternos.org/go/', { waitUntil: 'networkidle2' });

    await page.type('#user', process.env.ATERNOS_EMAIL);
    await page.type('#password', process.env.ATERNOS_PASSWORD);

    await Promise.all([
      page.click('#login'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);

    if (!page.url().includes('/server/')) {
      throw new Error('❌ Ошибка входа в Aternos. Проверь логин и пароль.');
    }

    // 2. Переход на страницу сервера (на всякий случай)
    await page.goto('https://aternos.org/server/', { waitUntil: 'networkidle2' });

    // 3. Проверка статуса
    await page.waitForSelector('.server-status', { timeout: 10000 });

    const isOnline = await page.$('.server-status.online');
    if (isOnline) {
      await browser.close();
      return '✅ Сервер уже запущен!';
    }

    // 4. Запуск сервера
    const startButton = await page.$('button.start');
    if (!startButton) throw new Error('❌ Кнопка запуска не найдена.');

    await startButton.click();
    await page.waitForTimeout(3000);

    await browser.close();
    return '✅ Запрос на запуск сервера отправлен!';
  } catch (err) {
    await browser.close();
    throw err;
  }
}

module.exports = startAternos;
