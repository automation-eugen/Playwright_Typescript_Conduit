export const edgeCaseStrings = {
  romanianDiacritics: 'Știință și tehnică în Țărișoara',
  emoji: 'Release 🚀 notes ✅',
  apostrophe: "O'Brien's test",
  html: '<script>alert(1)</script>',
  sqlLike: "'; DROP TABLE articles; --",
  rtl: 'مرحبا بالعالم',
  whitespace: '  leading and trailing  ',
  long: 'a'.repeat(5000),
} as const;