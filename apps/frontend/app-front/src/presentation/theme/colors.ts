export const SBColors = {
  STARBUCKS_GREEN: '#006241',
  GREEN_ACCENT: '#00754A',
  HOUSE_GREEN: '#1E3932',
  GREEN_UPLIFT: '#2b5148',
  GREEN_LIGHT: '#d4e9e2',

  GOLD: '#cba258',
  GOLD_LIGHT: '#dfc49d',
  GOLD_LIGHTEST: '#faf6ee',

  WHITE: '#ffffff',
  NEUTRAL_COOL: '#f9f9f9',
  NEUTRAL_WARM: '#f2f0eb',
  CERAMIC: '#edebe9',
  BLACK: '#000000',

  TEXT_BLACK: 'rgba(0, 0, 0, 0.87)',
  TEXT_BLACK_SOFT: 'rgba(0, 0, 0, 0.58)',
  TEXT_WHITE: 'rgba(255, 255, 255, 1)',
  TEXT_WHITE_SOFT: 'rgba(255, 255, 255, 0.70)',
  REWARDS_GREEN: '#33433d',

  RED: '#c82014',
  YELLOW: '#fbbc05',
  RED_TINT: 'rgba(200, 32, 20, 0.05)',

  TRANSPARENT_BLACK_06: 'rgba(0,0,0,0.06)',
  TRANSPARENT_BLACK_10: 'rgba(0,0,0,0.10)',
  TRANSPARENT_BLACK_14: 'rgba(0,0,0,0.14)',
  TRANSPARENT_BLACK_24: 'rgba(0,0,0,0.24)',
  TRANSPARENT_WHITE_10: 'rgba(255,255,255,0.10)',
} as const;

export type ColorKey = keyof typeof SBColors;
