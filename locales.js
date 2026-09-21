const locales = {
  ru: {
    welcome: (name, gold, scrap, cores, wallet) => {
      let wStr = wallet ? '💎 TON Кошелек: ' + wallet.slice(0,6) + '...' + wallet.slice(-6) + '\n' : '💎 Кошелек: Не привязан\n';
      let cStr = cores > 0 ? '⚡ Ядра Яутжа: ' + cores + ' шт.\n' : '';
      return '🪐 *ДОБРО ПОЖАЛОВАТЬ НА ПЛАНЕТУ ПОТАЛА* 🪐\n\nПриветствуем тебя, *' + name + '*!\n💰 Баланс: *' + gold + ' Gold* | ⚙️ Лом: *' + scrap + '*\n' + cStr + wStr + '\nВоин, выбери свой путь:';
    },
    btn_arena: "⚔️ Войти на Арену", btn_wastelands: "🏜️ Пустоши (Авто-фарм)", btn_wallet: "💎 Кошелек / TON Wallet", btn_lang: "🌍 Сменить язык / Change Language", btn_menu: "↩️ В Меню",
    wastelands_farming: (mins) => '🏜 *ПУСТОШИ*\n⏱ Время в походе: *' + mins + ' мин.*\n\n_Сервер ведет охоту! Твой телефон может быть выключен._',
    wastelands_desc: "🏜 *ПУСТОШИ*\n💰 Авто-фарм Золота и Металлолома.\n🎁 Шанс 15% найти редкое Ядро Яутжа!",
    btn_claim: "🎒 Собрать добычу", btn_start_farm: "🚀 Запустить авто-фарм", btn_status: "📊 Status", farm_started: "🚀 *Фарм запущен!*", too_early: "⏳ Рано еще!",
    loot_report: (g, s, e) => `🎒 *ДОБЫЧА ИЗ ПУСТОШЕЙ:* \n💰 Золото: *+\${g}*\n⚙️ Лом: *+s*{e ? '\n🔥 Найдено *⚡ Plasma Core Яутжа*!' : ''}`,
    choose_weapon: "⚔️ *ВЫБЕРИ СНАРЯЖЕНИЕ ДЛЯ АРЕНЫ:*", btn_bow: "🏹 Лук (Пенчак Силат) [Яд]", btn_claws: "🩸 Когти (Вин Чун) [Урон]",
    wallet_menu: (w) => w ? `💎 *ТВОЙ TON КОШЕЛЕК:* \n\`${w}\`` : '💎 *ПОДКЛЮЧЕНИЕ TON КОШЕЛЬКА* \n\nОтправь мне адрес своего TON кошелька текстовым сообщением.',
    wallet_success: "✅ *Успех!* Твой TON кошелек привязан!", wallet_invalid: "❌ *Ошибка!* Неверный формат TON адреса.",
    arena_intro: "🛸 Перед тобой свирепый Хищник Яутжа (100 HP).\n\n*ВЫБЕРИ ЗОНУ ДЛЯ УДАРА:*",
    arena_defend_intro: "🎯 Цель зафиксирована!\n*ТЕПЕРЬ УСТАНОВИ БЛОК ДЛЯ ЗАЩИТЫ:*",
    arena_win: "🎉 *ПОБЕДА НА АРЕНЕ!*\n\n🏆 Ты поверг Хищника Поталы! Ожидай NFT...", arena_lose: "💀 *ТЫ ПОГИБ!*\n\nХищник оказался сильнее."
  },
  en: {
    welcome: (name, gold, scrap, cores, wallet) => {
      let wStr = wallet ? '💎 TON Wallet: ' + wallet.slice(0,6) + '...' + wallet.slice(-6) + '\n' : '💎 Wallet: Not connected\n';
      let cStr = cores > 0 ? '⚡ Yautja Cores: ' + cores + ' pcs\n' : '';
      return '🪐 *WELCOME TO PLANET POTALA* 🪐\n\nGreetings, *' + name + '*!\n💰 Balance: *' + gold + ' Gold* | ⚙️ Scrap: *' + scrap + '*\n' + cStr + wStr + '\nWarrior, choose your path:';
    },
    btn_arena: "⚔️ Enter Arena", btn_wastelands: "🏜️ Wastelands (Auto-Farm)", btn_wallet: "💎 Wallet / TON Wallet", btn_lang: "🌍 Change Language / Сменить язык", btn_menu: "↩️ Menu",
    wastelands_farming: (mins) => '🏜 *WASTELANDS*\n⏱ Farming time: *' + mins + ' min*\n\n_Server is hunting!_',
    wastelands_desc: "🏜 *WASTELANDS*\n💰 Auto-farm Gold & Scrap.",
    btn_claim: "🎒 Claim Loot", btn_start_farm: "🚀 Start Auto-Farm", btn_status: "📊 Status", farm_started: "🚀 *Farming Started!*", too_early: "⏳ Too early!",
    loot_report: (g, s, e) => `🎒 *WASTELANDS LOOT:* \n💰 Gold: *+\${g}*\n⚙️ Scrap: *+s*{e ? '\n🔥 Found *⚡ Yautja Plasma Core*!' : ''}`,
    choose_weapon: "⚔️ *SELECT YOUR GEAR:*", btn_bow: "🏹 Bow (Pencak Silat) [Poison]", btn_claws: "🩸 Claws (Wing Chun) [Damage]",
    wallet_menu: (w) => w ? `💎 *YOUR TON WALLET:* \n\`${w}\`` : '💎 *CONNECT TON WALLET* \n\nSend your TON wallet address as a message.',
    wallet_success: "✅ *Success!* Wallet linked!", wallet_invalid: "❌ *Error!* Invalid TON address.",
    arena_intro: "🛸 A fierce Predator stands before you (100 HP).\n\n*CHOOSE YOUR TARGET ZONE:*",
    arena_defend_intro: "🎯 Target locked!\n*NOW CHOOSE YOUR DEFENSE ZONE:*",
    arena_win: "🎉 *ARENA VICTORY!*\n\n🏆 Trophy NFT minting...", arena_lose: "💀 *YOU DIED!*"
  }
};

module.exports = locales;
