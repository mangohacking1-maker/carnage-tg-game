const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_TOKEN;

if (!token) {
  console.error("ОШИБКА БЕЗОПАСНОСТИ: Секретный TELEGRAM_TOKEN не найден в системе!");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
console.log("Сервер «Арены Чести» успешно запущен в защищенном режиме 24/7...");

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || "Незнакомец";
  console.log(`[🛡️ ЗАЩИТА] Пользователь @${username} (ID: ${chatId}) запросил вход на Арену.`);

  const welcomeMessage = `⚔️ Добро пожаловать на Арену Чести, Воин!\n\nЗдесь куется сталь и рождаются легенды. Готов ли ты пролить первую кровь и заработать золото?`;
  const options = {
    reply_markup: {
      inline_keyboard: [[{ text: '⚔️ Вступить в бой!', callback_data: 'start_battle_search' }]]
    }
  };
  bot.sendMessage(chatId, welcomeMessage, options);
});

bot.on('callback_query', (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const action = callbackQuery.data;

  if (action === 'start_battle_search') {
    bot.answerCallbackQuery(callbackQuery.id, { text: "Поиск соперника начат..." });
    bot.sendMessage(chatId, "🛡️ Система ищет вам равного соперника на Арене... Приготовьтесь к бою!");
    console.log(`[⚔️ АРЕНА] Игрок на сервере встал в очередь хаотичного боя.`);
  }
});
