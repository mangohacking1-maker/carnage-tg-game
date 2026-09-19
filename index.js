const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const { createClient } = require('@supabase/supabase-js');

const token = process.env.TELEGRAM_TOKEN;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!token || !supabaseUrl || !supabaseKey) {
  console.error("❌ CRITICAL: Environment variables missing!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Active');
}).listen(port);

const bot = new TelegramBot(token, { polling: true });

const activeFights = new Map();
const activeExpeditions = new Map();
const walletState = new Map();

const locales = {
  ru: {
    welcome: (name, gold, scrap, cores, wallet) => `🪐 *ДОБРО ПОЖАЛОВАТЬ НА ПЛАНЕТУ ПОТАЛА* 🪐\n\nПриветствуем тебя, *${name}*!\n💰 Баланс: *${gold} Gold* | ⚙️ Лом: *${scrap}*\n${cores > 0 ? `⚡ Ядра Яутжа: *${cores} шт.*\n` : ''}${wallet ? `💎 TON Кошелек: \`${wallet.slice(0,6)}...${wallet.slice(-6)}\`\n` : '💎 Кошелек: *Не привязан*\n'}\nВоин, выбери свой путь:`,
    btn_arena: "⚔️ Войти на Арену",
    btn_wastelands: "🏜️ Пустоши (Авто-фарм)",
    btn_wallet: "💎 Кошелек / TON Wallet",
    btn_lang: "🌍 Сменить язык / Change Language",
    btn_menu: "↩️ В Меню",
    wastelands_farming: (mins) => `🏜 *ПУСТОШИ*\n⏱ Время в походе: *${mins} мин.*\n\n_Сервер ведет охоту! Твой телефон может быть выключен._`,
    wastelands_desc: "🏜 *ПУСТОШИ*\n💰 Авто-фарм Золота и Металлолома.\n🎁 Шанс 15% найти редкое Ядро Яутжа!",
    btn_claim: "🎒 Собрать добычу",
    btn_start_farm: "🚀 Запустить авто-фарм",
    btn_status: "📊 Status",
    farm_started: "🚀 *Фарм запущен!* Выходи из бота, выключай телефон — процесс идет на сервере.",
    too_early: "⏳ Прошло слишком мало времени! Пустоши еще не принесли плодов.",
    loot_report: (gold, scrap, epic) => `🎒 *ДОБЫЧА ИЗ ПУСТОШЕЙ:* \n💰 Золото: *+${gold}*\n⚙️ Металлолом: *+${scrap}*${epic ? '\n🔥 *СЮРПРИЗ:* Найдено *⚡ Plasma Core Яутжа*!' : ''}\n\nДанные сохранены в базу.`,
    choose_weapon: "⚔️ *ВЫБЕРИ СНАРЯЖЕНИЕ ДЛЯ АРЕНЫ:*",
    btn_bow: "🏹 Лук (Пенчак Силат) [Яд]",
    btn_claws: "🩸 Когти (Вин Чун) [Урон]",
    wallet_menu: (wallet) => wallet ? `💎 *ТВОЙ TON КОШЕЛЕК:* \n\`${wallet}\`\n\nТы можешь отправить новый адрес сообщением, чтобы изменить его.` : `💎 *ПОДКЛЮЧЕНИЕ TON КОШЕЛЬКА* \n\nОтправь мне адрес своего TON кошелька (например, из Tonkeeper) обычным текстовым сообщением в ответ на это меню.`,
    wallet_success: "✅ *Успех!* Твой TON кошелек успешно привязан и сохранен в вечную базу данных!",
    wallet_invalid: "❌ *Ошибка!* Неверный формат TON адреса. Адрес должен начинаться на EQ или UQ и содержать около 48 символов. Попробуй еще раз!"
  },
  en: {
    welcome: (name, gold, scrap, cores, wallet) => `🪐 *WELCOME TO PLANET POTALA* 🪐\n\nGreetings, *${name}*!\n💰 Balance: *${gold} Gold* | ⚙️ Scrap: *${scrap}*\n${cores > 0 ? `⚡ Yautja Cores: *${cores} pcs*\n` : ''}${wallet ? `💎 TON Wallet: \`${wallet.slice(0,6)}...${wallet.slice(-6)}\`\n` : '💎 Wallet: *Not connected*\n'}\nWarrior, choose your path:`,
    btn_arena: "⚔️ Enter Arena",
    btn_wastelands: "🏜️ Wastelands (Auto-Farm)",
    btn_wallet: "💎 Wallet / TON Wallet",
    btn_lang: "🌍 Change Language / Сменить язык",
    btn_menu: "↩️ Menu",
    wastelands_farming: (mins) => `🏜 *WASTELANDS*\n⏱ Farming time: *${mins} min*\n\n_Server is hunting! Your phone can be OFF!_`,
    wastelands_desc: "🏜 *WASTELANDS*\n💰 Auto-farm Gold & Scrap.\n🎁 15% Lucky chance for Yautja Core!",
    btn_claim: "🎒 Claim Loot",
    btn_start_farm: "🚀 Start Auto-Farm",
    btn_status: "📊 Status",
    farm_started: "🚀 *Farming Started!* Close the bot, turn off your phone — server is running.",
    too_early: "⏳ Too early! Wastelands haven't brought any rewards yet.",
    loot_report: (gold, scrap, epic) => `🎒 *WASTELANDS LOOT:* \n💰 Gold: *+${gold}*\n⚙️ Scrap: *+${scrap}*${epic ? '\n🔥 *SURPRISE:* Found *⚡ Yautja Plasma Core*!' : ''}\n\nData saved securely to DB.`,
    choose_weapon: "⚔️ *SELECT YOUR GEAR:*",
    btn_bow: "🏹 Bow (Pencak Silat) [Poison]",
    btn_claws: "🩸 Claws (Wing Chun) [Damage]",
    wallet_menu: (wallet) => wallet ? `💎 *YOUR TON WALLET:* \n\`${wallet}\`\n\nYou can send a new address as a text message to change it.` : `💎 *CONNECT TON WALLET* \n\nSend your TON wallet address (e.g., from Tonkeeper) as a plain text message to this chat.`,
    wallet_success: "✅ *Success!* Your TON wallet has been linked and saved securely!",
    wallet_invalid: "❌ *Error!* Invalid TON address format. It must start with EQ or UQ and be around 48 chars long. Try again!"
  }
};

async function getOrCreatePlayer(tgId, username) {
  try {
    let { data: player, error } = await supabase
      .from('players')
      .select('*')
      .eq('tg_id', tgId)
      .single();

    if (error && error.code === 'PGRST116') {
      const { data: newPlayer, error: createError } = await supabase
        .from('players')
        .insert([{ tg_id: tgId, username: username, language: 'ru' }])
        .select()
        .single();
      
      if (createError) console.error("DB_ERROR:", createError);
      return newPlayer;
    }
    return player;
  } catch (e) {
    console.error("SYSTEM_ERROR_DB:", e);
    return null;
  }
}

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/')) return;

  if (walletState.get(chatId) === 'awaiting_wallet') {
    const player = await getOrCreatePlayer(chatId, msg.from.username || 'Warbound');
    const lang = player ? (player.language || 'ru') : 'ru';
    const ui = locales[lang];

    const cleanText = text.trim();
    const isTonAddress = /^(EQ|UQ)[A-Za-z0-9_-]{42,46}$/.test(cleanText);

    if (isTonAddress) {
      walletState.delete(chatId);
      await supabase.from('players').update({ wallet_address: cleanText }).eq('tg_id', chatId);

      bot.sendMessage(chatId, ui.wallet_success, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: ui.btn_menu, callback_data: 'back_to_main' }]] }
      });
    } else {
      bot.sendMessage(chatId, ui.wallet_invalid, { parse_mode: 'Markdown' });
    }
  }
});

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || 'Warbound';
  
  activeFights.delete(chatId);
  walletState.delete(chatId);
  
  const player = await getOrCreatePlayer(chatId, username);
  const lang = player ? (player.language || 'ru') : 'ru';
  const text = locales[lang];
  
  bot.sendMessage(chatId, text.welcome(username, player ? player.gold : 0, player ? player.scrap : 0, player ? player.plasma_cores : 0, player ? player.wallet_address : null), {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: text.btn_arena, callback_data: 'choose_weapon' }],
        [{ text: text.btn_wastelands, callback_data: 'menu_wastelands' }],
        [{ text: text.btn_wallet, callback_data: 'menu_wallet' }],
        [{ text: text.btn_lang, callback_data: 'toggle_language' }]
      ]
    }
  });
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const data = query.data;

  bot.answerCallbackQuery(query.id).catch(() => {});

  const player = await getOrCreatePlayer(chatId, query.from.username || 'Warbound');
  let lang = player ? (player.language || 'ru') : 'ru';
  let text = locales[lang];

  if (data === 'toggle_language') {
    const newLang = lang === 'ru' ? 'en' : 'ru';
    await supabase.from('players').update({ language: newLang }).eq('tg_id', chatId);
    
    text = locales[newLang];
    
    let menuMsg = text.welcome(query.from.username || 'Warbound', player ? player.gold : 0, player ? player.scrap : 0, player ? player.plasma_cores : 0, player ? player.wallet_address : null);
    bot.editMessageText(menuMsg, {
      chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: text.btn_arena, callback_data: 'choose_weapon' }],
          [{ text: text.btn_wastelands, callback_data: 'menu_wastelands' }],
          [{ text: text.btn_wallet, callback_data: 'menu_wallet' }],
          [{ text: text.btn_lang, callback_data: 'toggle_language' }]
        ]
      }
    }).catch(() => {});
    return;
  }

  if (data === 'menu_wallet') {
    walletState.set(chatId, 'awaiting_wallet');
    bot.editMessageText(text.wallet_menu(player ? player.wallet_address : null), {
      chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: text.btn_menu, callback_data: 'back_to_main' }]] }
    }).catch(() => {});
  }

  if (data === 'menu_wastelands') {
    walletState.delete(chatId);
    if (activeExpeditions.has(chatId)) {
      const exp = activeExpeditions.get(chatId);
      const mins = Math.floor((Date.now() - exp.startTime) / 60000);
      bot.editMessageText(text.wastelands_farming(mins), {
        chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: text.btn_claim, callback_data: 'claim_loot' }]] }
      }).catch(() => {});
    } else {
      bot.editMessageText(text.wastelands_desc, {
        chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: text.btn_start_farm, callback_data: 'start_expedition' }],
            [{ text: text.btn_menu, callback_data: 'back_to_main' }]
          ]
        }
      }).catch(() => {});
    }
  }

  if (data === 'start_expedition') {
    activeExpeditions.set(chatId, { startTime: Date.now() });
    bot.editMessageText(text.farm_started, {
      chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',

    // Базовая хакерская проверка TON адреса (длина 44-48 символов, старт с EQ или UQ)
    const cleanText = text.trim();
    const isTonAddress = /^(EQ|UQ)[A-Za-z0-9_-]{42,46}$/.test(cleanText);

    if (isTonAddress) {
      walletState.delete(chatId); // Выключаем режим ожидания кошелька
      
      // Пишем кошелек намертво в Supabase
      await supabase.from('players').update({ wallet_address: cleanText }).eq('tg_id', chatId);

      bot.sendMessage(chatId, ui.wallet_success, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: ui.btn_menu, callback_data: 'back_to_main' }]] }
      });
    } else {
      bot.sendMessage(chatId, ui.wallet_invalid, { parse_mode: 'Markdown' });
    }
  }
});

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || 'Warbound';
  
  activeFights.delete(chatId);
  walletState.delete(chatId);
  
  const player = await getOrCreatePlayer(chatId, username);
  const lang = player ? (player.language || 'ru') : 'ru';
  const text = locales[lang];
  
  bot.sendMessage(chatId, text.welcome(username, player ? player.gold : 0, player ? player.scrap : 0, player ? player.plasma_cores : 0, player ? player.wallet_address : null), {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: text.btn_arena, callback_data: 'choose_weapon' }],
        [{ text: text.btn_wastelands, callback_data: 'menu_wastelands' }],
        [{ text: text.btn_wallet, callback_data: 'menu_wallet' }],
        [{ text: text.btn_lang, callback_data: 'toggle_language' }]
      ]
    }
  });
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const data = query.data;

  bot.answerCallbackQuery(query.id).catch(() => {});

  const player = await getOrCreatePlayer(chatId, query.from.username || 'Warbound');
  let lang = player ? (player.language || 'ru') : 'ru';
  let text = locales[lang];

  if (data === 'toggle_language') {
    const newLang = lang === 'ru' ? 'en' : 'ru';
    await supabase.from('players').update({ language: newLang }).eq('tg_id', chatId);
    
    text = locales[newLang];
    
    let menuMsg = text.welcome(query.from.username || 'Warbound', player ? player.gold : 0, player ? player.scrap : 0, player ? player.plasma_cores : 0, player ? player.wallet_address : null);
    bot.editMessageText(menuMsg, {
      chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: text.btn_arena, callback_data: 'choose_weapon' }],
          [{ text: text.btn_wastelands, callback_data: 'menu_wastelands' }],
          [{ text: text.btn_wallet, callback_data: 'menu_wallet' }],
          [{ text: text.btn_lang, callback_data: 'toggle_language' }]
        ]
      }
    }).catch(() => {});
    return;
  }

  if (data === 'menu_wallet') {
    walletState.set(chatId, 'awaiting_wallet'); // Включаем режим ловли кошелька текстом
    bot.editMessageText(text.wallet_menu(player ? player.wallet_address : null), {
      chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: text.btn_menu, callback_data: 'back_to_main' }]] }
    }).catch(() => {});
  }

  if (data === 'menu_wastelands') {
    walletState.delete(chatId);
    if (activeExpeditions.has(chatId)) {
      const exp = activeExpeditions.get(chatId);
      const mins = Math.floor((Date.now() - exp.startTime) / 60000);
      bot.editMessageText(text.wastelands_farming(mins), {
        chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: text.btn_claim, callback_data: 'claim_loot' }]] }
      }).catch(() => {});
    } else {
      bot.editMessageText(text.wastelands_desc, {
        chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: text.btn_start_farm, callback_data: 'start_expedition' }],
            [{ text: text.btn_menu, callback_data: 'back_to_main' }]
          ]
        }
      }).catch(() => {});
    }
  }


bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const data = query.data;

  bot.answerCallbackQuery(query.id).catch(() => {});

  const player = await getOrCreatePlayer(chatId, query.from.username || 'Warbound');
  let lang = player ? (player.language || 'ru') : 'ru';
  let text = locales[lang];

  if (data === 'toggle_language') {
    const newLang = lang === 'ru' ? 'en' : 'ru';
    await supabase.from('players').update({ language: newLang }).eq('tg_id', chatId);
    
    text = locales[newLang];
    
    let menuMsg = text.welcome(query.from.username || 'Warbound', player ? player.gold : 0, player ? player.scrap : 0, player ? player.plasma_cores : 0);
    bot.editMessageText(menuMsg, {
      chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: text.btn_arena, callback_data: 'choose_weapon' }],
          [{ text: text.btn_wastelands, callback_data: 'menu_wastelands' }],
          [{ text: text.btn_lang, callback_data: 'toggle_language' }]
        ]
      }
    }).catch(() => {});
    return;
  }

  if (data === 'menu_wastelands') {
    if (activeExpeditions.has(chatId)) {
      const exp = activeExpeditions.get(chatId);
      const mins = Math.floor((Date.now() - exp.startTime) / 60000);
      bot.editMessageText(text.wastelands_farming(mins), {
        chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: text.btn_claim, callback_data: 'claim_loot' }]] }
      }).catch(() => {});
    } else {
      bot.editMessageText(text.wastelands_desc, {
        chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: text.btn_start_farm, callback_data: 'start_expedition' }],
            [{ text: text.btn_menu, callback_data: 'back_to_main' }]
          ]
        }
      }).catch(() => {});
    }
  }

  if (data === 'start_expedition') {
    activeExpeditions.set(chatId, { startTime: Date.now() });
    bot.editMessageText(text.farm_started, {
      chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: text.btn_status, callback_data: 'menu_wastelands' }]] }
    }).catch(() => {});
  }

  if (data === 'claim_loot') {
    const exp = activeExpeditions.get(chatId);
    if (!exp) return;

    const secs = Math.floor((Date.now() - exp.startTime) / 1000);
    if (secs < 5) return bot.sendMessage(chatId, text.too_early);

    const goldEarned = secs * 2;
    const scrapEarned = secs * 5;
    const isEpic = Math.random() < 0.15;
    const coresEarned = isEpic ? 1 : 0;

    activeExpeditions.delete(chatId);

    await supabase
      .from('players')
      .update({
        gold: ((player ? player.gold : 0) || 0) + goldEarned,
        scrap: ((player ? player.scrap : 0) || 0) + scrapEarned,
        plasma_cores: ((player ? player.plasma_cores : 0) || 0) + coresEarned
      })
      .eq('tg_id', chatId);

    bot.sendMessage(chatId, text.loot_report(goldEarned, scrapEarned, isEpic), {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: text.btn_menu, callback_data: 'back_to_main' }]] }
    });
  }

  if (data === 'choose_weapon') {
    bot.editMessageText(text.choose_weapon, {
      chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: text.btn_bow, callback_data: 'w_bow' }],
          [{ text: text.btn_claws, callback_data: 'w_claws' }]
        ]
      }
    }).catch(() => {});
  }

  if (data === 'back_to_main') {
    activeFights.delete(chatId);
    const freshPlayer = await getOrCreatePlayer(chatId, query.from.username || 'Warbound');
    
    bot.editMessageText(text.welcome(query.from.username || 'Warbound', freshPlayer ? freshPlayer.gold : 0, freshPlayer ? freshPlayer.scrap : 0, freshPlayer ? freshPlayer.plasma_cores : 0), {
      chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: text.btn_arena, callback_data: 'choose_weapon' }],
          [{ text: text.btn_wastelands, callback_data: 'menu_wastelands' }],
          [{ text: text.btn_lang, callback_data: 'toggle_language' }]
        ]
      }
    }).catch(() => {});
  }
});
