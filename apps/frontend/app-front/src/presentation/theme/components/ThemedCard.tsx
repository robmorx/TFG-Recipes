import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SBColors, SBSpacing, SBRadius, SBShadow } from '../index';

export type CardVariant =
  | 'default'
  | 'feature-band'
  | 'neutral-cool';

type ThemedCardProps = {
  variant?: CardVariant;
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number | 'none' | 'sm' | 'md' | 'lg';
};

export function ThemedCard({
  variant = 'default',
  children,
  style,
  padding = 'md',
}: ThemedCardProps) {
  const cardStyles = getCardStyles(variant);
  const paddingValue = getPadding(padding);

  return (
    <View style={[s.baseCard, cardStyles, paddingValue, style]}>
      {children}
    </View>
  );
}

function getCardStyles(variant: CardVariant): ViewStyle {
  switch (variant) {
    case 'default':
      return {
        backgroundColor: SBColors.WHITE,
        ...SBShadow.card,
        borderWidth: 0,
      };
    case 'feature-band':
      return {
        backgroundColor: SBColors.HOUSE_GREEN,
        shadowColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
      };
    case 'neutral-cool':
      return {
        backgroundColor: SBColors.NEUTRAL_COOL,
        ...SBShadow.cardSoft,
      };
    default:
      return {};
  }
}

function getPadding(p: ThemedCardProps['padding']): ViewStyle {
  if (p === 'none') return { padding: 0 };
  if (p === 'sm') return { padding: SBSpacing.space3 };
  if (p === 'lg') return { padding: SBSpacing.space5 };
  return { padding: SBSpacing.space4 };
}

const s = StyleSheet.create({
  baseCard: {
    borderRadius: SBRadius.card,
  },
});
