const puppeteer = require('puppeteer');
const fs = require('fs');

module.exports = async function startAternos() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();

  try {
    // 1. Переход на страницу входа
    await page.goto('https://aternos.org/go/', { waitUntil: 'networkidle2' });
    await page.goto('https://aternos.org/login/', { waitUntil: 'networkidle2' });

    // 2. Скриншот страницы (на случай ошибки)
    await page.screenshot({ path: 'aternos_login_page.png' });

    // 3. Ввод логина и пароля
    await page.waitForSelector('input[name="user"]');
    await page.type('input[name="user"]', process.env.ATERNOS_EMAIL);
    await page.type('input[name="password"]', process.env.ATERNOS_PASSWORD);

    // 4. Вход
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);

    // 5. Проверка входа
    if (!page.url().includes('/servers')) {
      throw new Error('❌ Ошибка входа в Aternos. Проверь логин и пароль.');
    }

    // 6. Переход к серверу
    await page.goto('https://aternos.org/servers/', { waitUntil: 'networkidle2' });

    // 7. Клик по серверу
    const [serverBtn] = await page.$x("//a[contains(@class, 'server-button')]");
    if (!serverBtn) throw new Error('❌ Кнопка сервера не найдена.');
    await serverBtn.click();

    // 8. Проверка состояния сервера
    await page.waitForSelector('button.start');

    const isRunning = await page.$('button.start[disabled]');
    if (isRunning) {
      await browser.close();
      return '✅ Сервер уже запущен!';
    }

    // 9. Запуск сервера
    await page.click('button.start');
    await page.waitForTimeout(3000);

    await browser.close();
    return '✅ Запрос на запуск сервера отправлен!';
  } catch (err) {
    await page.screenshot({ path: 'aternos_login_page.png' });
    await browser.close();
    throw err;
  }
};
