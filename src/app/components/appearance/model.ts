export const themes = [
  { id: 'dark', name: 'Dark', description: 'The original study palette' },
  { id: 'midnight', name: 'Midnight', description: 'Cool, deep-blue surfaces' },
  { id: 'warm', name: 'Warm', description: 'Soft, warm-toned surfaces' },
  { id: 'paper', name: 'Paper', description: 'Clean, neutral light surfaces' },
  { id: 'dawn', name: 'Dawn', description: 'Warm cream, gentler light surfaces' },
];

export const isTheme = (value: string | null) => themes.some((theme) => theme.id === value);
