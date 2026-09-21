const WEAPON_BALANCING = {
  bow: { name_ru: "Композитный Лук [Яд]", name_en: "Compound Bow [Poison]", directDamage: 15, poisonDamage: 8, poisonDuration: 3 },
  claws: { name_ru: "Энергетические Когти [Урон]", name_en: "Energy Claws [Damage]", directDamage: 30, critChance: 0.35, critMultiplier: 1.5 }
};

const BATTLE_ZONES = {
  head: { ru: "🎯 Голова (Head)", en: "🎯 Head" },
  chest: { ru: "🛡 Грудь (Chest)", en: "🛡 Chest" },
  belt: { ru: "🎒 Пояс (Belt)", en: "🎒 Belt" },
  legs: { ru: "🦿 Ноги (Legs)", en: "🦿 Legs" }
};

function calculateLimbDamage(limbs, zone, dm) {
  let cur = { ...limbs }; let log = ""; if (dm <= 0) return { cur, log };
  if (zone === 'legs') {
    if (Math.random() < 0.5) { cur.limb_left_leg = Math.max(0, cur.limb_left_leg - 8); log = "\n🩸 L. Leg injured!"; }
    else { cur.limb_right_leg = Math.max(0, cur.limb_right_leg - 8); log = "\n🩸 R. Leg injured!"; }
  } else if (zone === 'chest' || zone === 'belt') {
    if (Math.random() < 0.5) { cur.limb_left_hand = Math.max(0, cur.limb_left_hand - 8); log = "\n🩸 L. Hand injured!"; }
    else { cur.limb_right_hand = Math.max(0, cur.limb_right_hand - 8); log = "\n🩸 R. Hand injured!"; }
  }
  return { cur, log };
}

function getAttackKeyboard(lang) {
  return { inline_keyboard: Object.keys(BATTLE_ZONES).map(z => [{ text: `⚔️ ${BATTLE_ZONES[z][lang]}`, callback_data: `a_atk_${z}` }]) };
}

function getDefendKeyboard(lang) {
  return { inline_keyboard: Object.keys(BATTLE_ZONES).map(z => [{ text: `🛡 ${BATTLE_ZONES[z][lang]}`, callback_data: `a_def_${z}` }]) };
}

module.exports = { WEAPON_BALANCING, BATTLE_ZONES, getAttackKeyboard, getDefendKeyboard, calculateLimbDamage };
