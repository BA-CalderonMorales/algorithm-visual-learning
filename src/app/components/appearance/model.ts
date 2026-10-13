export const themes = [
  { id: 'dark', name: 'Dark', description: 'The original study palette' },
  { id: 'midnight', name: 'Midnight', description: 'Cool, deep-blue surfaces' },
  { id: 'warm', name: 'Warm', description: 'Soft, warm-toned surfaces' },
  { id: 'paper', name: 'Paper', description: 'Clean, neutral light surfaces' },
  { id: 'dawn', name: 'Dawn', description: 'Warm cream, gentler light surfaces' },
  { id: 'dark-plus', name: 'Dark+', description: 'Neutral charcoal with clear blue accents' },
  { id: 'light-plus', name: 'Light+', description: 'Bright editor-inspired neutral surfaces' },
  { id: 'monokai', name: 'Monokai', description: 'Warm charcoal and vivid instructional accents' },
  { id: 'dracula', name: 'Dracula', description: 'Purple charcoal with soft bright text' },
  { id: 'nord', name: 'Nord', description: 'Arctic blue-gray with restrained contrast' },
  { id: 'solarized-dark', name: 'Solarized Dark', description: 'Deep teal with warm muted text' },
  { id: 'solarized-light', name: 'Solarized Light', description: 'Warm parchment and dark teal text' },
  { id: 'one-dark', name: 'One Dark', description: 'Balanced slate with soft blue accents' },
  { id: 'tokyo-night', name: 'Tokyo Night', description: 'Inky violet-blue with cool bright text' },
  { id: 'high-contrast', name: 'High Contrast', description: 'Black surfaces, white text, visible boundaries' },
];

export const isTheme = (value: string | null) => themes.some((theme) => theme.id === value);
