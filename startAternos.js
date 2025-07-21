const puppeteer = require('puppeteer');

module.exports = async function startAternos() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  try {
    await page.goto('https://aternos.org/account/', { waitUntil: 'networkidle2' });

    // Сделать скриншот страницы
    await page.screenshot({ path: 'aternos_login_page.png' });
    const fs = require('fs');
    const { AttachmentBuilder } = require('discord.js');

    // в index.js
    if (message.content === '!старт') {
    await message.reply('⏳ Пытаюсь запустить сервер Aternos...');
    try {
    const result = await startAternos();
    await message.reply(result);
  } catch (error) {
    try {
      const file = new AttachmentBuilder('./aternos_login_page.png');
      await message.reply({ content: `❌ Ошибка:\n\`\`\`${error.message}\`\`\``, files: [file] });
    } catch {
      await message.reply(`❌ Ошибка:\n\`\`\`${error.message}\`\`\``);
    }
  }
}


    await page.waitForSelector('input[name="user"]');

    await page.goto('https://aternos.org/account/', { waitUntil: 'networkidle2' });

    // Ждём поля логина
    await page.waitForSelector('input[name="user"]');
    await page.type('input[name="user"]', process.env.ATERNOS_EMAIL);
    await page.type('input[name="password"]', process.env.ATERNOS_PASSWORD);

    // Кнопка входа
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);

    // Проверка успешного входа
    if (!page.url().includes('/servers')) {
      throw new Error('❌ Ошибка входа в Aternos. Проверь логин и пароль.');
    }

    // Открываем страницу сервера
    await page.goto('https://aternos.org/servers/', { waitUntil: 'networkidle2' });

    // Ждём кнопку сервера
    const [serverBtn] = await page.$x("//a[contains(@class, 'server-button')]");
    if (!serverBtn) throw new Error('❌ Кнопка сервера не найдена.');
    await serverBtn.click();

    // Ждём кнопку старта
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
