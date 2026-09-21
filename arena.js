// ==========================================
// НАСТРОЙКИ БАЛАНСА АРЕНЫ v3.0 (Apex / CS style)
// ==========================================
const WEAPON_BALANCING = {
    bow: {
        name_ru: "Лук Пенчак Силат [Яд]",
        name_en: "Bow (Pencak Silat) [Poison]",
        directDamage: 15,
        poisonDamage: 8,
        poisonDuration: 3
    },
    claws: {
        name_ru: "Когти Вин Чун [Урон]",
        name_en: "Claws (Wing Chun) [Damage]",
        directDamage: 30,
        critChance: 0.35,
        critMultiplier: 1.5
    }
};

const BATTLE_ZONES = {
    head: { ru: "🎯 Голова (Head)", en: "🎯 Head" },
    chest: { ru: "🛡 Грудь (Chest)", en: "🛡 Chest" },
    belt: { ru: "🎒 Пояс (Belt)", en: "🎒 Belt" },
    legs: { ru: "🦿 Ноги (Legs)", en: "🦿 Legs" }
};

function getAttackKeyboard(lang) {
  return {
    inline_keyboard: Object.keys(BATTLE_ZONES).map(zone => [
      { text: `⚔️ ${BATTLE_ZONES[zone][lang]}`, callback_data: `a_atk_${zone}` }
    ])
  };
}

function getDefendKeyboard(lang) {
  return {
    inline_keyboard: Object.keys(BATTLE_ZONES).map(zone => [
      { text: `🛡 ${BATTLE_ZONES[zone][lang]}`, callback_data: `a_def_${zone}` }
    ])
  };
}

module.exports = {
  WEAPON_BALANCING,
  BATTLE_ZONES,
  getAttackKeyboard,
  getDefendKeyboard
};
