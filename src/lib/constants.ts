// NYSC Item Types and Size Options

export const ITEM_TYPES = [
  { value: "khaki_jacket", label: "Khaki Jacket" },
  { value: "khaki_trouser", label: "Khaki Trouser" },
  { value: "jungle_boot", label: "Jungle Boot" },
  { value: "crested_vest", label: "Crested Vest" },
  { value: "white_shorts", label: "White Shorts" },
  { value: "white_shirt", label: "White Shirt" },
  { value: "belt", label: "Belt" },
  { value: "socks", label: "Socks" },
  { value: "face_cap", label: "Face Cap" },
] as const;

export const SECURITY_QUESTIONS = [
  { value: "mother_maiden", label: "What is your mother's maiden name?" },
  { value: "first_pet", label: "What was the name of your first pet?" },
  { value: "birth_city", label: "In which city were you born?" },
  { value: "childhood_friend", label: "What is the name of your childhood best friend?" },
  { value: "primary_school", label: "What is the name of your primary school?" },
  { value: "favorite_teacher", label: "What is the name of your favorite teacher?" },
  { value: "favorite_food", label: "What is your favorite food?" },
  { value: "nickname", label: "What was your childhood nickname?" },
] as const;

export const CLOTHING_SIZES = [
  { value: "XS", label: "XS (Extra Small)" },
  { value: "S", label: "S (Small)" },
  { value: "M", label: "M (Medium)" },
  { value: "L", label: "L (Large)" },
  { value: "XL", label: "XL (Extra Large)" },
  { value: "XXL", label: "XXL (Double XL)" },
  { value: "XXXL", label: "XXXL (Triple XL)" },
] as const;

export const BOOT_SIZES = [
  { value: "38", label: "38 (EU) / 5 (UK)" },
  { value: "39", label: "39 (EU) / 6 (UK)" },
  { value: "40", label: "40 (EU) / 6.5 (UK)" },
  { value: "41", label: "41 (EU) / 7 (UK)" },
  { value: "42", label: "42 (EU) / 8 (UK)" },
  { value: "43", label: "43 (EU) / 9 (UK)" },
  { value: "44", label: "44 (EU) / 9.5 (UK)" },
  { value: "45", label: "45 (EU) / 10 (UK)" },
  { value: "46", label: "46 (EU) / 11 (UK)" },
  { value: "47", label: "47 (EU) / 12 (UK)" },
] as const;

// Boot items use boot sizes, everything else uses clothing sizes
export const BOOT_ITEMS = ["jungle_boot"];

export function getSizesForItem(itemType: string) {
  return BOOT_ITEMS.includes(itemType) ? BOOT_SIZES : CLOTHING_SIZES;
}

export function getItemLabel(value: string) {
  return ITEM_TYPES.find(item => item.value === value)?.label || value;
}

// Popular NYSC camps
export const NYSC_CAMPS = [
  { value: "any", label: "Any Camp (Global Match)" },
  { value: "abia", label: "Abia - Umunna" },
  { value: "adamawa", label: "Adamawa - Damare" },
  { value: "akwa_ibom", label: "Akwa Ibom - Ikot Itie Udung" },
  { value: "anambra", label: "Anambra - Umuawulu/Mbaukwu" },
  { value: "bauchi", label: "Bauchi - Wailo" },
  { value: "bayelsa", label: "Bayelsa - Kaiama" },
  { value: "benue", label: "Benue - Wannune" },
  { value: "borno", label: "Borno - Maiduguri" },
  { value: "cross_river", label: "Cross River - Obubra" },
  { value: "delta", label: "Delta - Issele-Uku" },
  { value: "ebonyi", label: "Ebonyi - Afikpo" },
  { value: "edo", label: "Edo - Okada" },
  { value: "ekiti", label: "Ekiti - Ise-Orun" },
  { value: "enugu", label: "Enugu - Iwo-Awka" },
  { value: "fct", label: "FCT - Kubwa" },
  { value: "gombe", label: "Gombe - Amada" },
  { value: "imo", label: "Imo - Umuguma/Ihiagwa" },
  { value: "jigawa", label: "Jigawa - Fanisau" },
  { value: "kaduna", label: "Kaduna - Kaduna South" },
  { value: "kano", label: "Kano - Karaye" },
  { value: "katsina", label: "Katsina - Mani" },
  { value: "kebbi", label: "Kebbi - Dakingari" },
  { value: "kogi", label: "Kogi - Asaya, Kabba" },
  { value: "kwara", label: "Kwara - Yikpata" },
  { value: "lagos", label: "Lagos - Iyana-Ipaja" },
  { value: "nasarawa", label: "Nasarawa - Keffi" },
  { value: "niger", label: "Niger - Paiko" },
  { value: "ogun", label: "Ogun - Sagamu" },
  { value: "ondo", label: "Ondo - Ikare-Akoko" },
  { value: "osun", label: "Osun - Ede" },
  { value: "oyo", label: "Oyo - Iseyin" },
  { value: "plateau", label: "Plateau - Mangu" },
  { value: "rivers", label: "Rivers - Nonwa-Gbam Tai" },
  { value: "sokoto", label: "Sokoto - Wamakko" },
  { value: "taraba", label: "Taraba - Sibre" },
  { value: "yobe", label: "Yobe - Damaturu" },
  { value: "zamfara", label: "Zamfara - Tsafe" },
] as const;

export function getCampLabel(value: string) {
  return NYSC_CAMPS.find(camp => camp.value === value)?.label || value || "Any Camp";
}
