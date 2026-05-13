import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { SBColors, SBSpacing, SBType } from '../index';

type ThemedInputProps = TextInputProps & {
  label?: string;
  error?: string;
  valid?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
};

export function ThemedInput({
  label,
  error,
  valid,
  containerStyle,
  inputStyle,
  labelStyle,
  ...rest
}: ThemedInputProps) {
  const inputBg = valid
    ? SBColors.GREEN_LIGHT + '55'
    : error
    ? SBColors.RED_TINT
    : SBColors.NEUTRAL_WARM;

  const borderColor = error
    ? SBColors.RED
    : valid
    ? SBColors.GREEN_ACCENT
    : SBColors.CERAMIC;

  return (
    <View style={[s.container, containerStyle]}>
      {label && (
        <Text style={[s.label, labelStyle]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          s.input,
          { backgroundColor: inputBg, borderColor },
          inputStyle,
        ]}
        placeholderTextColor={SBColors.TEXT_BLACK_SOFT}
        {...rest}
      />
      {error && (
        <Text style={s.errorText}>{error}</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginBottom: SBSpacing.space3,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: SBColors.TEXT_BLACK,
    marginBottom: 6,
    letterSpacing: SBType.letterSpacingNormal,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: SBSpacing.space3,
    paddingVertical: 14,
    fontSize: 15,
    color: SBColors.TEXT_BLACK,
    borderWidth: 1,
    letterSpacing: SBType.letterSpacingNormal,
  },
  errorText: {
    fontSize: 12,
    color: SBColors.RED,
    marginTop: 4,
    fontWeight: '500',
  },
});
