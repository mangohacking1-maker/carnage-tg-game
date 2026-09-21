const locales = {
  en: {
    welcome: (name, g, s, c, w, mp=100, st=100, d=4) => {
      let wStr = w ? "┃ 💎 TON WALLET: `" + w.slice(0,6) + "..." + w.slice(-6) + "`\n" : "┃ 💎 TON WALLET: Not connected\n";
      let cStr = c > 0 ? "┃ 👑 CORES: *" + c + " CORE*\n" : "";
      return "╔══════════════════════════════════╗\n    ⚜️  A R E N A  O F  H O N O R  ⚜️\n╚══════════════════════════════════╝\n🪐 *PLANET POTALA • SESSION v2.0*\n\n┃ 👤 WARRIOR: *" + name + "*\n┃ ⚜️ BALANCE: *" + g + " GOLD* │ ⚙️ SCRAP: *" + s + "*\n" + cStr + wStr + "┃ 🔷 MANA: *" + mp + " MP* │ 🟢 STAMINA: *" + st + "%*\n┃ _M. Diamonds: " + ("♦︎".repeat(d) || "None") + "_\n──────────────────────────────────\nWarrior, choose your path:";
    },
    btn_arena: "⚔️ Enter Arena", 
    btn_wastelands: "🏜️ Wastelands (Auto-Farm)", 
    btn_wallet: "💎 TON Wallet", 
    btn_market: "🏛️ Marketplace",
    btn_menu: "↩️ Menu",
    wastelands_farming: (mins) => "╔══════════════════════════════════════╗\n       ⚜️  W A S T E L A N D S  ⚜️\n╚══════════════════════════════════════╝\n🌌 SECTOR: Dark Orbit • Planet Potala\n\n⏱ SEARCH TIME: [ " + mins + " min ]\n🛰 DRONES STATUS: Active 🟢\n\n──────────────────────────────────────\n┃ 📦 Auto-mining: Gold & Metallic Scrap\n┃ 📡 Connection: Stable encryption\n──────────────────────────────────────\n_Server is hunting. Your device can be OFF._",
    wastelands_desc: "╔══════════════════════════════════════╗\n       ⚜️  W A S T E L A N D S  ⚜️\n╚══════════════════════════════════════╝\n🪐 Infinite dark sectors of Potala planet.\n\n┃ 💰 Auto-farm Gold & Scrap 24/7.\n┃ 🎁 15% Chance to find Plasma Core.\n──────────────────────────────────────",
    btn_claim: "🎒 Claim Loot", btn_start_farm: "🚀 Start Auto-Farm", btn_status: "📊 Drones Status", farm_started: "🚀 *Expedition deployed!*", too_early: "⏳ Too early! Wait at least 1 minute.",
    loot_report: (g, s, e) => "╔══════════════════════════════════════╗\n             🎒 LOOT REPORT            \n╚══════════════════════════════════════╝\nCargo safely delivered to warehouse:\n\n┃ ⚜️ Gold: *+" + g + "*\n┃ ⚙️ Scrap: *+" + s + "*\n" + (e ? "┃ ⚡ *FOUND:* Rare Plasma Core!\n" : "") + "──────────────────────────────────────\nData secured to Supabase.",
    choose_weapon: "╔══════════════════════════════════╗\n            ⚔️ GEAR SELECTION         \n╚══════════════════════════════════╝\n\nSelect your combat gear for the Arena:", 
    btn_bow: "🏹 Compound Bow [Poison]", btn_claws: "🩸 Energy Claws [Damage]",
    wallet_menu: (w) => w ? "╔══════════════════════════════════╗\n            💎 TONKEEPER WALLET       \n╚══════════════════════════════════╝\n┃ Status: Linked successfully.\n┃ Address: `" + w + "`" : "╔══════════════════════════════════╗\n            💎 TONKEEPER WALLET       \n╚══════════════════════════════════╝\n┃ No wallet detected.\n\n_Send your TON wallet address as a text message._",
    wallet_success: "✅ *Sync complete!* Wallet saved to Supabase.", wallet_invalid: "❌ *Format Error!* Must start with EQ/UQ.",
    arena_intro: "🛸 A fierce Alien Hunter stands before you (100 HP).\n\n*CHOOSE YOUR ATTACK TARGET:*", arena_defend_intro: "🎯 Target locked!\n*CHOOSE YOUR BLOCK DIRECTION:*",
    arena_win: "⚜️ ═══ V I C T O R Y ═══ ⚜️\n\n🏆 You defeated the Alien Hunter!", arena_lose: "💀 ═══ W A R R I O R  D I E D ═══ 💀",
    market_menu: (mg, pm) => "╔══════════════════════════════════════╗\n    ⚜️  M A R K E T P L A C E  ⚜️\n╚══════════════════════════════════════╝\n👤 NPC: Trophy Merchant\n🏛 Merchant Gold: [ " + mg + " GOLD ]\n──────────────────────────────────────\n📦 YOUR INVENTORY:\n🎭 Hunter Mask: *" + pm + " pcs*\n\n_Sell price: 500 Gold per trophy._\n──────────────────────────────────────",
    btn_sell_mask: "💰 Sell Mask for 500 Gold", market_empty_merchant: "⚜️ *Merchant out of gold!*", market_no_items: "❌ *You have no Masks to sell!*", market_success_sell: "✅ *Success!* Mask sold to merchant."
  }
};

module.exports = locales;
