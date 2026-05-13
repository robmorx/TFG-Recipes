import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SBColors, SBSpacing, SBRadius, SBType, SBFonts } from '../index';

export type ButtonVariant =
  | 'primary-filled'
  | 'primary-outlined'
  | 'black-filled'
  | 'dark-outlined'
  | 'inverted'
  | 'outlined-on-dark';

type ThemedButtonProps = {
  variant?: ButtonVariant;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  fullWidth?: boolean;
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function ThemedButton({
  variant = 'primary-filled',
  label,
  onPress,
  disabled = false,
  loading = false,
  style,
  labelStyle,
  fullWidth = true,
}: ThemedButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withTiming(0.95, { duration: 100 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 200 });
  };

  const buttonStyles = getButtonStyles(variant);
  const textStyles = getTextStyles(variant);

  const isActuallyDisabled = disabled || loading;

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isActuallyDisabled}
      activeOpacity={1}
      style={[
        s.baseButton,
        fullWidth && s.fullWidth,
        buttonStyles,
        isActuallyDisabled && s.disabled,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary-outlined' || variant === 'dark-outlined' || variant === 'outlined-on-dark'
            ? buttonStyles.borderColor || SBColors.WHITE
            : SBColors.WHITE
          }
        />
      ) : (
        <Text style={[s.baseLabel, textStyles, labelStyle]}>
          {label}
        </Text>
      )}
    </AnimatedTouchable>
  );
}

function getButtonStyles(variant: ButtonVariant): ViewStyle {
  switch (variant) {
    case 'primary-filled':
      return {
        backgroundColor: SBColors.GREEN_ACCENT,
        borderWidth: 1,
        borderColor: SBColors.GREEN_ACCENT,
      };
    case 'primary-outlined':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: SBColors.GREEN_ACCENT,
      };
    case 'black-filled':
      return {
        backgroundColor: SBColors.BLACK,
        borderWidth: 1,
        borderColor: SBColors.BLACK,
      };
    case 'dark-outlined':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: SBColors.TEXT_BLACK,
      };
    case 'inverted':
      return {
        backgroundColor: SBColors.WHITE,
        borderWidth: 1,
        borderColor: SBColors.WHITE,
      };
    case 'outlined-on-dark':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: SBColors.WHITE,
      };
    default:
      return {};
  }
}

function getTextStyles(variant: ButtonVariant): TextStyle {
  switch (variant) {
    case 'primary-filled':
    case 'black-filled':
      return { color: SBColors.WHITE };
    case 'primary-outlined':
      return { color: SBColors.GREEN_ACCENT };
    case 'dark-outlined':
      return { color: SBColors.TEXT_BLACK };
    case 'inverted':
      return { color: SBColors.GREEN_ACCENT };
    case 'outlined-on-dark':
      return { color: SBColors.WHITE };
    default:
      return {};
  }
}

const s = StyleSheet.create({
  baseButton: {
    borderRadius: SBRadius.button,
    paddingVertical: 14,
    paddingHorizontal: SBSpacing.space4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  fullWidth: {
    width: '100%',
  },
  baseLabel: {
    fontSize: 16,
    fontFamily: SBFonts.semibold,
    letterSpacing: SBType.letterSpacingNormal,
  },
  disabled: {
    opacity: 0.5,
  },
});
