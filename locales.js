const locales = {
  ru: {
    welcome: (name, g, s, c, w, mp=100, st=100, d=4) => {
      let wStr = w ? "┃ 💎 TON WALLET: `" + w.slice(0,6) + "..." + w.slice(-6) + "`\n" : "┃ 💎 TON WALLET: Not linked\n";
      let cStr = c > 0 ? "┃ 👑 CORES: *" + c + " CORE*\n" : "";
      return "╔══════════════════════════════════╗\n    ⚜️  A R E N A  O F  H O N O R  ⚜️\n╚══════════════════════════════════╝\n🪐 *ПЛАНЕТА ПОТАЛА • СЕССИЯ v2.0*\n\n┃ 👤 WARRIOR: *" + name + "*\n┃ ⚜️ BALANCE: *" + g + " GOLD* │ ⚙️ SCRAP: *" + s + "*\n" + cStr + wStr + "┃ 🔷 MANA: *" + mp + " MP* │ 🟢 STAMINA: *" + st + "%*\n┃ _M. Diamonds: " + ("♦︎".repeat(d) || "None") + "_\n──────────────────────────────────\nВоин, выбери свой путь:";
    },
    btn_arena: "⚔️ Войти на Арену / Enter Arena", 
    btn_wastelands: "🏜️ Пустоши (Авто-фарм)", 
    btn_wallet: "💎 Кошелек / TON Wallet", 
    btn_lang: "🌍 Change Language / Сменить язык", 
    btn_menu: "↩️ В Меню",
    btn_market: "🏛️ Торговая Площадь / Marketplace",
    wastelands_farming: (mins) => "╔══════════════════════════════════════╗\n       ⚜️  W A S T E L A N D S  ⚜️\n╚══════════════════════════════════════╝\n🌌 SECTOR: Dark Orbit • Planet Potala\n\n⏱ SEARCH TIME: [ " + mins + " min ]\n🛰 DRONES STATUS: Active 🟢\n\n──────────────────────────────────────\n┃ 📦 Auto-mining: Gold & Metallic Scrap\n┃ 📡 Connection: Stable encryption\n──────────────────────────────────────\n_Server is hunting. Your device can be OFF._",
    wastelands_desc: "╔══════════════════════════════════════╗\n       ⚜️  W A S T E L A N D S  ⚜️\n╚══════════════════════════════════════╝\n🪐 Бесконечные темные сектора планеты Потала.\n\n┃ 💰 Авто-добыча Золота и Лома 24/7.\n┃ 🎁 Шанс 15% найти редкое Энергетическое Ядро.\n──────────────────────────────────────",
    btn_claim: "🎒 Собрать добычу", btn_start_farm: "🚀 Запустить авто-фарм", btn_status: "📊 Статус фармера", farm_started: "🚀 *Экспедиция задеплоена!*", too_early: "⏳ Рано еще!",
    loot_report: (g, s, e) => "╔══════════════════════════════════════╗\n             🎒 LOOT REPORT            \n╚══════════════════════════════════════╝\nДобыча успешно доставлена на склад:\n\n┃ ⚜️ Золото: *+" + g + "*\n┃ ⚙️ Металлолом: *+" + s + "*\n" + (e ? "┃ ⚡ *НАХОДКА:* Редкое Энергетическое Ядро!\n" : "") + "──────────────────────────────────────\nДанные успешно сохранены в Supabase.",
    choose_weapon: "╔══════════════════════════════════╗\n            ⚔️ GEAR SELECTION         \n╚══════════════════════════════════╝\n\nВыбери боевую экипировку для выхода на дуэль:", 
    btn_bow: "🏹 Compound Bow [Poison]", btn_claws: "🩸 Energy Claws [Damage]",
    wallet_menu: (w) => w ? "╔══════════════════════════════════╗\n            💎 TONKEEPER WALLET       \n╚══════════════════════════════════╝\n┃ Успешно привязан к системе.\n┃ Адрес: `" + w + "`" : "╔══════════════════════════════════╗\n            💎 TONKEEPER WALLET       \n╚══════════════════════════════════╝\n┃ Кошелек не обнаружен.\n\n_Отправь адрес своего TON-кошелька текстовым сообщением._",
    wallet_success: "✅ *Синхронизация успешна!*", wallet_invalid: "❌ *Ошибка формата!*",
    arena_intro: "🛸 Перед тобой свирепый Alien Hunter (100 HP).\n\n*ВЫБЕРИ НАПРАВЛЕНИЕ УДАРA:*", arena_defend_intro: "🎯 Цель зафиксирована!\n*ВЫБЕРИ НАПРАВЛЕНИЕ БЛОКА:*",
    arena_win: "⚜️ ═══ П О Б Е Д А ═══ ⚜️\n\n🏆 Ты поверг Чужого на Потале!\nТрофей доставлен в инвентарь сессии.", arena_lose: "💀 ═══ Т Ы  П О Г И Б ═══ 💀\n\nИнопланетный Охотник оказался сильнее.",
    
    // ЭЛИТНЫЙ РЫНОК DIOR (RU)
    market_menu: (merchantGold, playerMasks) => "╔══════════════════════════════════════╗\n    ⚜️  M A R K E T P L A C E  ⚜️\n╚══════════════════════════════════════╝\n👤 NPC: Скупщик Трофеев Поталы\n🏛 Казна торговца: [ " + merchantGold + " GOLD ]\n──────────────────────────────────────\n📦 ТВОЙ ИНВЕНТАРЬ:\n🎭 Маска Охотника: *" + playerMasks + " шт.*\n\n_Цена скупки: 500 Gold за трофей._\n──────────────────────────────────────",
    btn_sell_mask: "💰 Продать Маску за 500 Gold",
    market_empty_merchant: "⚜️ *У торговца иссякли запасы золота!* Ожидайте привоза ликвидности галактическим караваном.",
    market_no_items: "❌ *У тебя нет Масок для продажи!* Сначала добудь трофей на Арене.",
    market_success_sell: "✅ *Успешно!* Маска продана торговцу. Казна обновилась."
  },
  en: {
    welcome: (name, g, s, c, w, mp=100, st=100, d=4) => {
      let wStr = w ? "┃ 💎 TON WALLET: `" + w.slice(0,6) + "..." + w.slice(-6) + "`\n" : "┃ 💎 TON WALLET: Not connected\n";
      let cStr = c > 0 ? "┃ 👑 PLASMA CORES: " + c + " CORE\n" : "";
      return "╔══════════════════════════════════╗\n    ⚜️  A R E N A  O F  H O N O R  ⚜️\n╚══════════════════════════════════╝\n🪐 *PLANET POTALA • SESSION v2.0*\n\n┃ 👤 WARRIOR: *" + name + "*\n┃ ⚜️ BALANCE: *" + g + " GOLD* │ ⚙️ SCRAP: *" + s + "*\n" + cStr + wStr + "┃ 🔷 MANA: *" + mp + " MP* │ 🟢 STAMINA: *" + st + "%*\n┃ _M. Diamonds: " + ("♦︎".repeat(d) || "None") + "_\n──────────────────────────────────\nWarrior, choose your path:";
    },
    btn_arena: "⚔️ Enter Arena / Войти на Арену", btn_wastelands: "🏜️ Wastelands (Auto-Farm)", btn_wallet: "💎 Wallet / TON Wallet", btn_lang: "🌍 Change Language / Сменить язык", btn_menu: "↩️ Menu", btn_market: "🏛️ Marketplace / Рынок",
    choose_weapon: "╔══════════════════════════════════╗\n            ⚔️ GEAR SELECTION         \n╚══════════════════════════════════╝\n\nSelect your gear for the Arena:", btn_bow: "🏹 Compound Bow [Poison]", btn_claws: "🩸 Energy Claws [Damage]",
    arena_intro: "🛸 A fierce Alien Hunter stands before you (100 HP).\n\n*CHOOSE YOUR ATTACK TARGET:*", arena_defend_intro: "🎯 Target locked!\n*CHOOSE YOUR BLOCK DIRECTION:*",
    arena_win: "⚜️ ═══ V I C T O R Y ═══ ⚜️\n\n🏆 You defeated the Alien Hunter!", arena_lose: "💀 ═══ W A R R I O R  D I E D ═══ 💀",
    
    // ЭЛИТНЫЙ РЫНОК DIOR (EN)
    market_menu: (merchantGold, playerMasks) => "╔══════════════════════════════════════╗\n    ⚜️  M A R K E T P L A C E  ⚜️\n╚══════════════════════════════════════╝\n👤 NPC: Trophy Merchant\n🏛 Merchant Gold: [ " + merchantGold + " GOLD ]\n──────────────────────────────────────\n📦 YOUR INVENTORY:\n🎭 Hunter Mask: *" + playerMasks + " pcs*\n\n_Sell price: 500 Gold per trophy._\n──────────────────────────────────────",
    btn_sell_mask: "💰 Sell Mask for 500 Gold",
    market_empty_merchant: "⚜️ *Merchant out of gold!* Wait for the next liquidity caravan.",
    market_no_items: "❌ *You have no Masks to sell!* Win battles on Arena first.",
    market_success_sell: "✅ *Success!* Mask sold to the merchant."
  }
};

module.exports = locales;
