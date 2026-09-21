// index.js
import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import text from './locales.js';
import { sellPlasmaCore, upgradeSharpness, processIdleExpedition } from './arena.js';

// Инициализация бота с жестким сбросом конкурирующих сессий
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { 
  polling: {
    autoStart: true,
    params: {
      // Этот флаг заставляет Telegram принудительно закрыть старый getUpdates и очистить очередь
      drop_pending_updates: true 
    }
  }
});

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Главная функция отрисовки меню
async function sendMainMenu(chatId, username) {
  try {
    let { data: player, error } = await supabase
      .from('players')
      .select('*')
      .eq('tg_id', username)
      .single();

    if (error || !player) {
      const { data: newPlayer } = await supabase
        .from('players')
        .insert([{ 
          tg_id: username, 
          gold: 0, 
          scrap: 0, 
          plasma_cores: 0, 
          marsel_diamonds: 0, 
          stamina: 100, 
          mp: 0,
          expedition_start: null 
        }])
        .select()
        .single();
      player = newPlayer;
    }

    if (player && player.expedition_start) {
      player = await processIdleExpedition(player);
    }

    const gold = player?.gold ?? 0;
    const scrap = player?.scrap ?? 0;
    const cores = player?.plasma_cores ?? 0;
    const diamonds = player?.marsel_diamonds ?? 0;

    const keyboard = {
      inline_keyboard: [
        [{ text: "⚔️ В бой на Арену", callback_data: "action_arena" }],
        [{ text: "🚀 Экспедиция за лутом", callback_data: "action_expedition" }],
        [{ text: "🏪 Зайти на Рынок", callback_data: "action_market" }]
      ]
    };

    const messageText = text && typeof text.welcome === 'function'
      ? text.welcome(username, gold, scrap, cores, diamonds)
      : `╔═════════════════════════════════════════╗\n║          💎 ARENA OF HONOR v2.0         ║\n╠═════════════════════════════════════════╣\n║  👤 ВОИН: @${username}\n║  💰 Золото: ${gold} ┃ 🛠️ Скрап: ${scrap}\n╚═════════════════════════════════════════╝`;

    await bot.sendMessage(chatId, messageText, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });

  } catch (err) {
    console.error("Критическая ошибка в роутере меню:", err);
    bot.sendMessage(chatId, "⚠️ Произошла системная ошибка при загрузке профиля. Попробуй /start еще раз.");
  }
}

// Слушатель текстовых команд
bot.on('message', (msg) => {
  if (!msg.text) return;
  const chatId = msg.chat.id;
  const username = msg.from.username || msg.from.id.toString();

  if (msg.text === '/start' || msg.text === 'Меню' || msg.text === '/menu') {
    sendMainMenu(chatId, username);
  }
});

// Слушатель нажатий на кнопки
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const username = callbackQuery.from.username || callbackQuery.from.id.toString();
  const data = callbackQuery.data;

  try {
    if (data === "action_market") {
      const { data: config } = await supabase.from('game_config').select('value_int').eq('key', 'merchant_gold').single();
      const merchantGold = config?.value_int ?? 5000;
      const { data: player } = await supabase.from('players').select('*').eq('tg_id', username).single();

      const marketKeyboard = {
        inline_keyboard: [
          [{ text: "🎭 Продать Plasma Core (+150G)", callback_data: "market_sell_core" }],
          [{ text: "⚡ Точить Оружие (+3 Шарп)", callback_data: "market_upgrade_sharp" }],
          [{ text: "🔙 Вернуться в Меню", callback_data: "go_to_menu" }]
        ]
      };

      const marketText = text && typeof text.renderMarketplaceItem === 'function'
        ? text.renderMarketplaceItem(player, merchantGold)
        : `🏪 Рынок открыт. Ликвидность торговца: ${merchantGold} Gold`;

      await bot.sendMessage(chatId, marketText, {
        parse_mode: 'Markdown',
        reply_markup: marketKeyboard
      });
    }

    if (data === "market_sell_core") {
      const res = await sellPlasmaCore(username);
      if (res.success) {
        await bot.answerCallbackQuery(callbackQuery.id, { text: "Маска успешно продана купцу! +150 Gold", show_alert: true });
      } else {
        await bot.answerCallbackQuery(callbackQuery.id, { text: `Ошибка: ${res.error || 'нет ресурсов'}`, show_alert: true });
      }
      await sendMainMenu(chatId, username);
    }

    if (data === "market_upgrade_sharp") {
      const res = await upgradeSharpness(username);
      if (res.success) {
        await bot.answerCallbackQuery(callbackQuery.id, { text: "Руны легли ровно! Оружие заточено на +3", show_alert: true });
      } else {
        await bot.answerCallbackQuery(callbackQuery.id, { text: "Не хватает золота (50) или скрапа (120)!", show_alert: true });
      }
      await sendMainMenu(chatId, username);
    }

    if (data === "action_expedition") {
      const nowISO = new Date().toISOString();
      await supabase.from('players').update({ expedition_start: nowISO }).eq('tg_id', username);
      
      const expKeyboard = { inline_keyboard: [[{ text: "🔄 Проверить лут и вернуться", callback_data: "go_to_menu" }]] };
      await bot.sendMessage(chatId, "🚀 Воин отправился вглубь пустошей на поиски лома и золота. Вернись позже, чтобы забрать хабар!", {
        reply_markup: expKeyboard
      });
    }

    if (data === "action_arena") {
      let droppedCore = Math.random() <= 0.15;
      if (droppedCore) {
        const { data: player } = await supabase.from('players').select('plasma_cores').eq('tg_id', username).single();
        await supabase.from('players').update({ plasma_cores: (player?.plasma_cores ?? 0) + 1 }).eq('tg_id', username);
        await bot.answerCallbackQuery(callbackQuery.id, { text: "⚔️ Победа! Ты выбил Plasma Core 🎭!", show_alert: true });
      } else {
        await bot.answerCallbackQuery(callbackQuery.id, { text: "⚔️ Бой окончен. Выживание подтверждено, но ценного лута не найдено.", show_alert: true });
      }
      await sendMainMenu(chatId, username);
    }

    if (data === "go_to_menu") {
      await bot.answerCallbackQuery(callbackQuery.id);
      await sendMainMenu(chatId, username);
    }

  } catch (err) {
    console.error("Ошибка обработки callback query:", err);
  }
});

console.log("🚀 Эфир чистый. Роутер ARENA OF HONOR v2.0 принудительно перехватил управление...");
