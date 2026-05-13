export const SBSpacing = {
  space1: 4,
  space2: 8,
  space3: 16,
  space4: 24,
  space5: 32,
  space6: 40,
  space7: 48,
  space8: 56,
  space9: 64,

  outerGutter: 16,
  outerGutterMedium: 24,
  outerGutterLarge: 40,
} as const;

export const SBRadius = {
  card: 12,
  button: 999,
  circle: 999,
  feedbackTabTop: 12,
} as const;

export const SBType = {
  letterSpacingNormal: -0.5,
  letterSpacingLoose: 1.6,
  letterSpacingLooser: 2.4,

  lineHeightNormal: 1.5,
  lineHeightCompact: 1.2,
} as const;

export const SBShadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.24,
    shadowRadius: 1,
    elevation: 2,
  },
  cardSoft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 0.5,
    elevation: 1,
  },
  nav: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  frapBase: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 6,
    elevation: 6,
  },
  frapAmbient: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 10,
  },
} as const;
