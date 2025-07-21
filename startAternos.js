await page.goto('https://aternos.org/login/', { waitUntil: 'networkidle2' });

await page.type('#user', process.env.ATERNOS_EMAIL);
await page.type('#password', process.env.ATERNOS_PASSWORD);

await Promise.all([
  page.click('#login'), // или '#login-form button[type="submit"]'
  page.waitForNavigation({ waitUntil: 'networkidle2' }),
]);

if (!page.url().includes('/server/')) {
  throw new Error('❌ Ошибка входа в Aternos. Проверь логин и пароль.');
}
