// index.js - ЧАСТЬ 1: ИМПОРТЫ И КОНФИГ
import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import text from './locales.js';
import { sellPlasmaCore, upgradeSharpness, processIdleExpedition } from './arena.js';

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { 
  polling: { autoStart: true, params: { drop_pending_updates: true } } 
});
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
// ЧАСТЬ 2: ГЛАВНОЕ МЕНЮ
async function sendMainMenu(chatId, username) {
  try {
    let { data: player, error } = await supabase.from('players').select('*').eq('tg_id', username).single();
    if (error || !player) {
      const { data: nP } = await supabase.from('players').insert([{ tg_id: username, gold: 0, scrap: 0, plasma_cores: 0, marsel_diamonds: 0, stamina: 100, mp: 0 }]).select().single();
      player = nP;
    }
    if (player && player.expedition_start) { player = await processIdleExpedition(player); }
    const gold = player?.gold ?? 0;
    const scrap = player?.scrap ?? 0;
    const cores = player?.plasma_cores ?? 0;
    const diamonds = player?.marsel_diamonds ?? 0;

    const keyboard = { inline_keyboard: [
      [{ text: "⚔️ В бой на Арену", callback_data: "action_arena" }],
      [{ text: "🚀 Экспедиция за лутом", callback_data: "action_expedition" }],
      [{ text: "🏪 Зайти на Рынок", callback_data: "action_market" }]
    ]};

    const msgText = text && typeof text.welcome === 'function'
      ? text.welcome(username, gold, scrap, cores, diamonds)
      : `💎 ARENA v2.0\nВоин: @${username}\n💰 Золото: ${gold} | 🛠️ Скрап: ${scrap}`;

    await bot.sendMessage(chatId, msgText, { parse_mode: 'Markdown', reply_markup: keyboard });
  } catch (err) { console.error(err); }
}

bot.on('message', (msg) => {
  if (!msg.text) return;
  if (['/start', 'Меню', '/menu'].includes(msg.text)) { sendMainMenu(msg.chat.id, msg.from.username || msg.from.id.toString()); }
});
// ЧАСТЬ 3: ОБРАБОТЧИК КНОПОК
bot.on('callback_query', async (cb) => {
  const chatId = cb.message.chat.id;
  const username = cb.from.username || cb.from.id.toString();
  const data = cb.data;

  try {
    if (data === "action_market") {
      const { data: cfg } = await supabase.from('game_config').select('value_int').eq('key', 'merchant_gold').single();
      const { data: player } = await supabase.from('players').select('*').eq('tg_id', username).single();
      const marketKeyboard = { inline_keyboard: [
        [{ text: "🎭 Продать Core (+150G)", callback_data: "m_sell" }],
        [{ text: "⚡ Точить (+3 Шарп)", callback_data: "m_up" }],
        [{ text: "🔙 В Меню", callback_data: "go_menu" }]
      ]};
      const mText = text?.renderMarketplaceItem ? text.renderMarketplaceItem(player, cfg?.value_int ?? 5000) : `🏪 Рынок`;
      await bot.sendMessage(chatId, mText, { parse_mode: 'Markdown', reply_markup: marketKeyboard });
    }
    if (data === "m_sell") { 
      await sellPlasmaCore(username); 
      await bot.answerCallbackQuery(cb.id, { text: "Продано!" });
      await sendMainMenu(chatId, username); 
    }
    if (data === "m_up") { 
      await upgradeSharpness(username); 
      await bot.answerCallbackQuery(cb.id, { text: "Заточено!" });
      await sendMainMenu(chatId, username); 
    }
    if (data === "action_expedition") {
      await supabase.from('players').update({ expedition_start: new Date().toISOString() }).eq('tg_id', username);
      await bot.sendMessage(chatId, "🚀 Ушел за лутом!", { reply_markup: { inline_keyboard: [[{ text: "🔄 Проверить лут", callback_data: "go_menu" }]] } });
    }
    if (data === "action_arena") {
      if (Math.random() <= 0.15) {
        const { data: p } = await supabase.from('players').select('plasma_cores').eq('tg_id', username).single();
        await supabase.from('players').update({ plasma_cores: (p?.plasma_cores ?? 0) + 1 }).eq('tg_id', username);
      }
      await bot.answerCallbackQuery(cb.id, { text: "Бой завершен" });
      await sendMainMenu(chatId, username);
    }
    if (data === "go_menu") { await bot.answerCallbackQuery(cb.id); await sendMainMenu(chatId, username); }
  } catch (err) { console.error(err); }
});
console.log("🚀 Эфир чистый. ARENA v2.0 в сети!");
