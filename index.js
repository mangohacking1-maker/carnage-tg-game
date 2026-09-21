// index.js - ARENA OF HONOR v2.0
import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import text from './locales.js';
import { sellPlasmaCore, upgradeSharpness, processIdleExpedition } from './arena.js';

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: false });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 1. ОЧИСТКА СЕТИ И ЗАПУСК
async function initBot() {
  try {
    console.log("⏳ Зачистка старых сессий...");
    await bot.setWebHook('', { drop_pending_updates: true }); 
    await new Promise(res => setTimeout(res, 3000)); 
    await bot.startPolling({ restart: true });
    console.log("🚀 Эфир чистый. ARENA v2.0 в сети!");
  } catch (err) { console.error("Ошибка сети:", err); }
}
initBot();

// 2. ГЛАВНОЕ МЕНЮ И ЛУТ
async function sendMainMenu(chatId, username) {
  try {
    let { data: p, error } = await supabase.from('players').select('*').eq('tg_id', username).single();
    if (error || !p) {
      const { data: nP } = await supabase.from('players').insert([{ tg_id: username, gold: 0, scrap: 0, plasma_cores: 0, marsel_diamonds: 0, stamina: 100, mp: 0 }]).select().single();
      p = nP;
    }
    if (p && p.expedition_start) { p = await processIdleExpedition(p); }
    
    const kbd = { inline_keyboard: [
      [{ text: "⚔️ В бой на Арену", callback_data: "action_arena" }],
      [{ text: "🚀 Экспедиция за лутом", callback_data: "action_expedition" }],
      [{ text: "🏪 Зайти на Рынок", callback_data: "action_market" }]
    ]};

    const msg = text?.welcome ? text.welcome(username, p.gold??0, p.scrap??0, p.plasma_cores??0, p.marsel_diamonds??0) : `💎 ARENA v2.0`;
    await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown', reply_markup: kbd });
  } catch (err) { console.error(err); }
}

bot.on('message', (msg) => {
  if (msg.text && ['/start', 'Меню'].includes(msg.text)) {
    sendMainMenu(msg.chat.id, msg.from.username || msg.from.id.toString());
  }
});

// 3. ТОРГОВЛЯ И КНОПКИ
bot.on('callback_query', async (cb) => {
  const chatId = cb.message.chat.id;
  const username = cb.from.username || cb.from.id.toString();
  try {
    if (cb.data === "action_market") {
      const { data: cfg } = await supabase.from('game_config').select('value_int').eq('key', 'merchant_gold').single();
      const { data: p } = await supabase.from('players').select('*').eq('tg_id', username).single();
      const mKbd = { inline_keyboard: [[{ text: "🎭 Продать Core (+150G)", callback_data: "m_sell" }], [{ text: "⚡ Точить (+3 Шарп)", callback_data: "m_up" }], [{ text: "🔙 В Меню", callback_data: "go_menu" }]]};
      await bot.sendMessage(chatId, text?.renderMarketplaceItem ? text.renderMarketplaceItem(p, cfg?.value_int??5000) : `🏪 Рынок`, { parse_mode: 'Markdown', reply_markup: mKbd });
    }
    if (cb.data === "m_sell") { await sellPlasmaCore(username); await bot.answerCallbackQuery(cb.id, { text: "Продано!" }); await sendMainMenu(chatId, username); }
    if (cb.data === "m_up") { await upgradeSharpness(username); await bot.answerCallbackQuery(cb.id, { text: "Заточено!" }); await sendMainMenu(chatId, username); }
    if (cb.data === "action_expedition") {
      await supabase.from('players').update({ expedition_start: new Date().toISOString() }).eq('tg_id', username);
      await bot.sendMessage(chatId, "🚀 Ушел за лутом!", { reply_markup: { inline_keyboard: [[{ text: "🔄 Проверить лут", callback_data: "go_menu" }]] } });
    }
    if (cb.data === "action_arena") {
      if (Math.random() <= 0.15) {
        const { data: p } = await supabase.from('players').select('plasma_cores').eq('tg_id', username).single();
        await supabase.from('players').update({ plasma_cores: (p?.plasma_cores ?? 0) + 1 }).eq('tg_id', username);
      }
      await bot.answerCallbackQuery(cb.id, { text: "Бой завершен" }); await sendMainMenu(chatId, username);
    }
    if (cb.data === "go_menu") { await bot.answerCallbackQuery(cb.id); await sendMainMenu(chatId, username); }
  } catch (err) { console.error(err); }
});
