const puppeteer = require('puppeteer');

module.exports = async function startAternos() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();

  try {
    // 1. Заходим на страницу логина
    await page.goto('https://aternos.org/go/', { waitUntil: 'networkidle2' });
    await page.goto('https://aternos.org/login/', { waitUntil: 'networkidle2' });

    // 2. Вводим логин и пароль
    await page.waitForSelector('input[name="user"]');
    await page.type('input[name="user"]', process.env.ATERNOS_EMAIL);
    await page.type('input[name="password"]', process.env.ATERNOS_PASSWORD);

    // 3. Входим и ждём переход на список серверов
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);

    // 4. Проверяем, что вход прошёл успешно
    if (!page.url().includes('/servers')) {
      throw new Error('❌ Ошибка входа в Aternos. Проверь логин и пароль.');
    }

    // 5. Открываем список серверов
    await page.goto('https://aternos.org/servers/', { waitUntil: 'networkidle2' });

    // 6. Находим кнопку сервера и кликаем
    const [serverBtn] = await page.$x("//a[contains(@class, 'server-button')]");
    if (!serverBtn) {
      throw new Error('❌ Кнопка сервера не найдена.');
    }
    await serverBtn.click();

    // 7. Ждём кнопку запуска
    await page.waitForSelector('button.start');

    // 8. Проверяем, уже ли сервер запущен
    const isRunning = await page.$('button.start[disabled]');
    if (isRunning) {
      await browser.close();
      return '✅ Сервер уже запущен!';
    }

    // 9. Кликаем по кнопке запуска
    await page.click('button.start');

    // 10. Немного ждём (например, 3 секунды) и завершаем
    await page.waitForTimeout(3000);
    await browser.close();

    return '✅ Запрос на запуск сервера отправлен!';
  } catch (err) {
    await browser.close();
    throw err;
  }
};
