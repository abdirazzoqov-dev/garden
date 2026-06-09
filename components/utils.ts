// ============================================================
// PARK CENTRAL — Utility / Helper Functions
// ============================================================

/** Number formatini bo'shliqli ko'rinishda chiqaradi: 142000 → "142 000" */
export const formatNumber = (num: number): string =>
  num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

/** Takrorlanmaydigan unique ID generatsiyasi */
export const getUniqueId = (prefix: string): string =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

/** Tizim vaqtini "HH:MM:SS" formatida qaytaradi */
export const getSystemTime = (): string =>
  new Date().toLocaleTimeString("uz-UZ", { hour12: false });

/** Tizim vaqtini "HH:MM" formatida qaytaradi */
export const getSystemTimeShort = (): string =>
  new Date().toLocaleTimeString("uz-UZ", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
