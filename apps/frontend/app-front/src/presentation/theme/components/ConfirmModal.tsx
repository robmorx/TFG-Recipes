import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { SBColors, SBSpacing, SBRadius, SBType, SBFonts } from '../index';
import { hapticLight } from '../haptics';

interface ConfirmModalProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onDismiss?: () => void;
  singleButton?: boolean;
  confirmDestructive?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function AnimatedCard({ children }: { children: React.ReactNode }) {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withTiming(1, { duration: 200 });
    opacity.value = withTiming(1, { duration: 200 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[s.card, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  onDismiss,
  singleButton = false,
  confirmDestructive = false,
  icon,
}: ConfirmModalProps) {

  const handleCancel = () => {
    hapticLight();
    onCancel?.();
    onDismiss?.();
  };

  const handleConfirm = () => {
    hapticLight();
    onConfirm?.();
    onDismiss?.();
  };

  const handleBackdrop = () => {
    if (singleButton) {
      onDismiss?.();
    } else {
      onCancel?.();
      onDismiss?.();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <Pressable style={s.backdrop} onPress={handleBackdrop}>
        <Pressable onPress={() => {}} style={s.centeredWrapper}>
          <AnimatedCard>
            {icon && (
              <View style={s.iconWrapper}>
                <MaterialCommunityIcons
                  name={icon}
                  size={40}
                  color={confirmDestructive ? SBColors.RED : SBColors.STARBUCKS_GREEN}
                />
              </View>
            )}

            {title && (
              <Text style={s.title}>
                {title}
              </Text>
            )}

            <Text style={s.message}>
              {message}
            </Text>

            <View style={s.buttonsRow}>
              {singleButton ? (
                <AnimatedTouchable
                  style={[s.button, s.confirmBtn, confirmDestructive && s.destructiveBtn]}
                  onPress={handleConfirm}
                  activeOpacity={0.9}
                  onPressIn={() => hapticLight()}
                >
                  <Text style={s.confirmBtnText}>{confirmLabel}</Text>
                </AnimatedTouchable>
              ) : (
                <>
                  <AnimatedTouchable
                    style={[s.button, s.cancelBtn]}
                    onPress={handleCancel}
                    activeOpacity={0.9}
                    onPressIn={() => hapticLight()}
                  >
                    <Text style={s.cancelBtnText}>{cancelLabel}</Text>
                  </AnimatedTouchable>
                  <View style={{ width: SBSpacing.space3 }} />
                  <AnimatedTouchable
                    style={[s.button, s.confirmBtn, confirmDestructive && s.destructiveBtn]}
                    onPress={handleConfirm}
                    activeOpacity={0.9}
                    onPressIn={() => hapticLight()}
                  >
                    <Text style={s.confirmBtnText}>{confirmLabel}</Text>
                  </AnimatedTouchable>
                </>
              )}
            </View>
          </AnimatedCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '82%',
    maxWidth: 340,
    backgroundColor: SBColors.WHITE,
    borderRadius: SBRadius.card * 1.2,
    paddingVertical: SBSpacing.space5,
    paddingHorizontal: SBSpacing.space5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  iconWrapper: {
    marginBottom: SBSpacing.space3,
  },
  title: {
    fontSize: 18,
    fontFamily: SBFonts.semibold,
    color: SBColors.TEXT_BLACK,
    textAlign: 'center',
    letterSpacing: SBType.letterSpacingNormal,
    marginBottom: SBSpacing.space2,
  },
  message: {
    fontSize: 14,
    fontFamily: SBFonts.regular,
    color: SBColors.TEXT_BLACK_SOFT,
    textAlign: 'center',
    letterSpacing: SBType.letterSpacingNormal,
    lineHeight: 20,
    marginBottom: SBSpacing.space4,
  },
  buttonsRow: {
    flexDirection: 'row',
    width: '100%',
  },
  button: {
    flex: 1,
    borderRadius: SBRadius.button,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelBtn: {
    backgroundColor: SBColors.NEUTRAL_WARM,
    borderWidth: 1,
    borderColor: SBColors.CERAMIC,
  },
  cancelBtnText: {
    fontSize: 15,
    fontFamily: SBFonts.semibold,
    color: SBColors.TEXT_BLACK,
    letterSpacing: SBType.letterSpacingNormal,
  },
  confirmBtn: {
    backgroundColor: SBColors.GREEN_ACCENT,
  },
  confirmBtnText: {
    fontSize: 15,
    fontFamily: SBFonts.semibold,
    color: SBColors.WHITE,
    letterSpacing: SBType.letterSpacingNormal,
  },
  destructiveBtn: {
    backgroundColor: SBColors.RED,
  },
});
