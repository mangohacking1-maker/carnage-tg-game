const WEAPON_BALANCING = {
  // Ближний бой (Melee)
  blades: { name_ru: "⚔️ Ритуальные Клинки", name_en: "⚔️ Ritual Blades", directDamage: 25, critChance: 0.20, critMultiplier: 1.4 },
  saber: { name_ru: "⚔️ Офицерская Сабля", name_en: "⚔️ Officer Saber", directDamage: 28, critChance: 0.15, critMultiplier: 1.5 },
  sword: { name_ru: "⚔️ Тяжелый Меч", name_en: "⚔️ Heavy Sword", directDamage: 35, critChance: 0.10, critMultiplier: 1.6 },
  knife: { name_ru: "🔪 Тактический Нож", name_en: "🔪 Tactical Knife", directDamage: 18, critChance: 0.40, critMultiplier: 1.5 },
  
  // Метательное (Throwables)
  th_knives: { name_ru: "🎯 Метательные Ножи", name_en: "🎯 Throwing Knives", directDamage: 20, critChance: 0.30, critMultiplier: 1.3 },
  axes: { name_ru: "🪓 Боевые Топоры", name_en: "🪓 Combat Axes", directDamage: 32, critChance: 0.12, critMultiplier: 1.5 },
  stars: { name_ru: "⭐ Стальные Звездочки", name_en: "⭐ Steel Stars", directDamage: 15, critChance: 0.50, critMultiplier: 1.4 },
  explosives: { name_ru: "💣 Направленная Взрывчатка", name_en: "💣 Targeted Explosive", directDamage: 45, critChance: 0.05, critMultiplier: 2.0 }
};

const BATTLE_ZONES = {
  head: { ru: "🎯 Голова (Head)", en: "🎯 Head" },
  chest: { ru: "🛡 Грудь (Chest)", en: "🛡 Chest" },
  belt: { ru: "🎒 Пояс (Belt)", en: "🎒 Belt" },
  legs: { ru: "🦿 Ноги (Legs)", en: "🦿 Legs" }
};

function getAttackKeyboard(lang) {
  return { inline_keyboard: Object.keys(BATTLE_ZONES).map(z => [{ text: `⚔️ ${BATTLE_ZONES[z][lang]}`, callback_data: `a_atk_${z}` }]) };
}

function getDefendKeyboard(lang) {
  return { inline_keyboard: Object.keys(BATTLE_ZONES).map(z => [{ text: `🛡 ${BATTLE_ZONES[z][lang]}`, callback_data: `a_def_${z}` }]) };
}

module.exports = { WEAPON_BALANCING, BATTLE_ZONES, getAttackKeyboard, getDefendKeyboard };
