const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const { createClient } = require('@supabase/supabase-js');
const arena = require('./arena');
const locales = require('./locales');

const token = process.env.TELEGRAM_TOKEN;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!token || !supabaseUrl || !supabaseKey) process.exit(1);
const supabase = createClient(supabaseUrl, supabaseKey);

const port = process.env.PORT || 3000;
http.createServer((req, res) => { res.writeHead(200); res.end('Active'); }).listen(port);

const bot = new TelegramBot(token, { polling: true });
const activeExpeditions = new Map();
const walletState = new Map();
const activeBattles = new Map();

async function getOrCreatePlayer(tgId, username) {
  let { data: p, error } = await supabase.from('players').select('*').eq('tg_id', tgId).single();
  if (error && error.code === 'PGRST116') {
    const { data: n } = await supabase.from('players').insert([{ tg_id: tgId, username: username, language: 'ru' }]).select().single();
    return n;
  }
  return p;
}

bot.on('message', async (msg) => {
  const chatId = msg.chat.id; const text = msg.text;
  if (!text || text.startsWith('/')) return;
  if (walletState.get(chatId) === 'awaiting_wallet') {
    const p = await getOrCreatePlayer(chatId, msg.from.username || 'Warbound');
    const lang = p ? (p.language || 'ru') : 'ru'; const ui = locales[lang]; const cleanText = text.trim();
    if (/^(EQ|UQ)[A-Za-z0-9_-]{42,46}$/.test(cleanText)) {
      walletState.delete(chatId); await supabase.from('players').update({ wallet_address: cleanText }).eq('tg_id', chatId);
      bot.sendMessage(chatId, ui.wallet_success, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: ui.btn_menu, callback_data: 'back_to_main' }]] } });
    } else { bot.sendMessage(chatId, ui.wallet_invalid, { parse_mode: 'Markdown' }); }
  }
});

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id; const username = msg.from.username || 'Warbound';
  activeBattles.delete(chatId); walletState.delete(chatId);
  const p = await getOrCreatePlayer(chatId, username);
  const lang = p ? (p.language || 'ru') : 'ru'; const text = locales[lang];
  bot.sendMessage(chatId, text.welcome(username, p?.gold || 0, p?.scrap || 0, p?.plasma_cores || 0, p?.wallet_address, p?.mp, p?.stamina, p?.marsel_diamonds), { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [ [{ text: text.btn_arena, callback_data: 'choose_weapon' }], [{ text: text.btn_wastelands, callback_data: 'menu_wastelands' }], [{ text: text.btn_wallet, callback_data: 'menu_wallet' }], [{ text: text.btn_lang, callback_data: 'toggle_language' }] ] } });
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id; const messageId = query.message.message_id; const data = query.data;
  bot.answerCallbackQuery(query.id).catch(() => {});
  const p = await getOrCreatePlayer(chatId, query.from.username || 'Warbound');
  let lang = p ? (p.language || 'ru') : 'ru'; let text = locales[lang];

  if (data === 'toggle_language') {
    const newLang = lang === 'ru' ? 'en' : 'ru'; await supabase.from('players').update({ language: newLang }).eq('tg_id', chatId); text = locales[newLang];
    bot.editMessageText(text.welcome(query.from.username || 'Warbound', p?.gold || 0, p?.scrap || 0, p?.plasma_cores || 0, p?.wallet_address, p?.mp, p?.stamina, p?.marsel_diamonds), { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: [ [{ text: text.btn_arena, callback_data: 'choose_weapon' }], [{ text: text.btn_wastelands, callback_data: 'menu_wastelands' }], [{ text: text.btn_wallet, callback_data: 'menu_wallet' }], [{ text: text.btn_lang, callback_data: 'toggle_language' }] ] } }).catch(() => {}); return;
  }

  if (data === 'menu_wallet') { walletState.set(chatId, 'awaiting_wallet'); bot.editMessageText(text.wallet_menu(p?.wallet_address), { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: text.btn_menu, callback_data: 'back_to_main' }]] } }).catch(() => {}); }
  
  if (data === 'menu_wastelands') {
    walletState.delete(chatId);
    if (activeExpeditions.has(chatId)) {
      const exp = activeExpeditions.get(chatId); const mins = Math.floor((Date.now() - exp.startTime) / 60000);
      bot.editMessageText(text.wastelands_farming(mins), { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: text.btn_claim, callback_data: 'claim_loot' }]] } }).catch(() => {});
    } else {
      bot.editMessageText(text.wastelands_desc, { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: [ [{ text: text.btn_start_farm, callback_data: 'start_expedition' }], [{ text: text.btn_menu, callback_data: 'back_to_main' }] ] } });
    }
  }
  if (data === 'start_expedition') { activeExpeditions.set(chatId, { startTime: Date.now() }); bot.editMessageText(text.farm_started, { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: text.btn_status, callback_data: 'menu_wastelands' }]] } }).catch(() => {}); }
  if (data === 'claim_loot') {
    const exp = activeExpeditions.get(chatId); if (!exp) return;
    const mins = Math.floor((Date.now() - exp.startTime) / 60000); if (mins < 1) return bot.sendMessage(chatId, text.too_early);
    const gEarned = mins * 15; const sEarned = mins * 30; const isEpic = Math.random() < 0.15; const cEarned = isEpic ? 1 : 0;
    activeExpeditions.delete(chatId);
    await supabase.from('players').update({ gold: (p?.gold || 0) + gEarned, scrap: (p?.scrap || 0) + sEarned, plasma_cores: (p?.plasma_cores || 0) + cEarned }).eq('tg_id', chatId);
    bot.sendMessage(chatId, text.loot_report(gEarned, sEarned, isEpic), { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: text.btn_menu, callback_data: 'back_to_main' }]] } });
  }
  if (data === 'back_to_main') {
    activeBattles.delete(chatId); walletState.delete(chatId); const up = await getOrCreatePlayer(chatId, query.from.username || 'Warbound');
    bot.editMessageText(text.welcome(query.from.username || 'Warbound', up?.gold || 0, up?.scrap || 0, up?.plasma_cores || 0, up?.wallet_address, up?.mp, up?.stamina, up?.marsel_diamonds), { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: { inline_keyboard: [ [{ text: text.btn_arena, callback_data: 'choose_weapon' }], [{ text: text.btn_wastelands, callback_data: 'menu_wastelands' }], [{ text: text.btn_wallet, callback_data: 'menu_wallet' }], [{ text: text.btn_lang, callback_data: 'toggle_language' }] ] } }).catch(() => {});
  }
});
