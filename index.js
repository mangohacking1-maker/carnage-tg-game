// index.js
import TelegramBot from 'telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import text from './locales.js'; // Корректный импорт дефолтного объекта
import { sellPlasmaCore, upgradeSharpness, processIdleExpedition } from './arena.js';

const bot = new TelegramBot({ token: process.env.TELEGRAM_TOKEN, updates: { polling: true } });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Главная функция отрисовки меню
async function sendMainMenu(chatId, username) {
  try {
    // 1. Извлекаем данные игрока из Supabase
    let { data: player, error } = await supabase
      .from('players')
      .select('*')
      .eq('tg_id', username)
      .single();

    // Если игрока нет в базе — создаем стартовую запись
    if (error || !player) {
      const { data: newPlayer } = await supabase
        .from('players')
        .insert([{ tg_id: username, gold: 0, scrap: 0, plasma_cores: 0, marsel_diamonds: 0, stamina: 100, mp: 0 }])
        .select()
        .single();
      player = newPlayer;
    }

    // 2. Рассчитываем пассивный доход за время отсутствия (если был поиск лута)
    if (player && player.expedition_start) {
      player = await processIdleExpedition(player);
    }

    // Safe-fallback переменные для предотвращения undefined
    const gold = player?.gold ?? 0;
    const scrap = player?.scrap ?? 0;
    const cores = player?.plasma_cores ?? 0;
    const diamonds = player?.marsel_diamonds ?? 0;

    // Генерируем клавиатуру
    const keyboard = {
      inline_keyboard: [
        [{ text: "⚔️ В бой на Арену", callback_data: "action_arena" }],
        [{ text: "🚀 Экспедиция за лутом", callback_data: "action_expedition" }],
        [{ text: "🏪 Зайти на Рынок", callback_data: "action_market" }]
      ]
    };

    // Строка 52: Безопасный вызов локализации
    const messageText = text && typeof text.welcome === 'function'
      ? text.welcome(username, gold, scrap, cores, diamonds)
      : `💎 ARENA OF HONOR 💎\n\nПривет, @${username}! Твои ресурсы: Золото: ${gold}, Скрап: ${scrap}`;

    await bot.sendMessage(chatId, messageText, {
      parse_mode: 'Markdown',
      reply_markup: JSON.stringify(keyboard)
    });

  } catch (err) {
    console.error("Критическая ошибка в роутере меню:", err);
    bot.sendMessage(chatId, "⚠️ Произошла системная ошибка при загрузке профиля. Попробуй позже.");
  }
}

// Слушатель входящих сообщений
bot.on('message', (msg) => {
  if (!msg.text) return;
  const chatId = msg.chat.id;
  const username = msg.from.username || msg.from.id.toString();

  if (msg.text === '/start' || msg.text === 'Меню') {
    sendMainMenu(chatId, username);
  }
});

// Слушатель кнопок (Callback Queries)
bot.on('inline_query', async (query) => {
  // Логика обработки кликов на Арену, Экспедицию или Рынок
  // При выходе в меню всегда вызываем: sendMainMenu(chatId, username);
});
