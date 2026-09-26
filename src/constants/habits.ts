export const HABIT_EMOJIS = ['🌱', '💧', '📖', '🚶', '🏃', '🧘', '💪', '🥗', '😴', '✍️', '🎨', '🎵', '🧹', '🧠', '☀️', '🪴', '💊', '🚲', '💻', '🐾', '🧵', '💬', '🍎', '✨'] as const;

export const HABIT_COLORS = [
  { name: 'Sage', value: '#557A60' },
  { name: 'Ocean', value: '#477A91' },
  { name: 'Lavender', value: '#7A68A2' },
  { name: 'Rose', value: '#A65C72' },
  { name: 'Terracotta', value: '#A56046' },
  { name: 'Gold', value: '#907021' },
  { name: 'Teal', value: '#387E7B' },
  { name: 'Slate', value: '#677586' },
] as const;

export const DEFAULT_HABIT = { title: '', description: '', emoji: HABIT_EMOJIS[0], color: HABIT_COLORS[0].value };
