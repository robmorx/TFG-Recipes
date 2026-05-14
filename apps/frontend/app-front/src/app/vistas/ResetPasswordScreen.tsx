import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUserVM } from '../../presentation/viewmodel/UserVM';
import { ThemedButton, ThemedCard, SBColors, SBSpacing, SBType, SBFonts, hapticLight, useAlert, ConfirmModal } from '../../presentation/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function AnimatedBackBtn({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={onPress}
      style={[s.backBtn, animatedStyle]}
      activeOpacity={0.95}
      onPressIn={() => {
        scale.value = withTiming(0.95, { duration: 100 });
        hapticLight();
      }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 200 }); }}
    >
      <MaterialCommunityIcons name="chevron-left" size={28} color={SBColors.TEXT_BLACK} />
    </AnimatedTouchable>
  );
}

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email, code } = useLocalSearchParams<{ email: string; code: string }>();
  const { resetPassword, isLoading } = useUserVM();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { alertProps, showAlert } = useAlert();

  const handleReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      showAlert({ title: 'Error', message: 'La contraseña debe tener al menos 6 caracteres', singleButton: true });
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert({ title: 'Error', message: 'Las contraseñas no coinciden', singleButton: true });
      return;
    }
    try {
      await resetPassword(decodeURIComponent(email), code, newPassword);
      showAlert({ title: 'Contraseña actualizada', message: 'Tu contraseña ha sido restablecida exitosamente', singleButton: true, confirmLabel: 'OK', icon: 'check-circle', onConfirm: () => router.replace('/vistas/LoginScreen') });
    } catch (error: any) {
      showAlert({ title: 'Error', message: error.message || 'No se pudo restablecer la contraseña', singleButton: true });
    }
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={SBColors.NEUTRAL_WARM} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.inner}
      >
        <View style={s.navbar}>
          <AnimatedBackBtn onPress={() => router.back()} />
          <Text style={s.navTitle}>Nueva contraseña</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={s.logoSection}>
          <MaterialCommunityIcons name="lock-outline" size={56} color={SBColors.STARBUCKS_GREEN} style={s.logoIcon} />
          <Text style={s.logoSubtitle}>
            Ingresa tu nueva contraseña
          </Text>
        </View>

        <ThemedCard padding="lg">
          <View style={s.field}>
            <Text style={s.label}>Nueva contraseña</Text>
            <TextInput
              style={s.input}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={SBColors.TEXT_BLACK_SOFT}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Confirmar contraseña</Text>
            <TextInput
              style={s.input}
              placeholder="Repite la contraseña"
              placeholderTextColor={SBColors.TEXT_BLACK_SOFT}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <View style={s.btnWrapper}>
            <ThemedButton
              variant="primary-filled"
              label={isLoading ? 'Guardando...' : 'Cambiar contraseña'}
              onPress={handleReset}
              disabled={!newPassword || !confirmPassword || isLoading}
              loading={isLoading}
              fullWidth
            />
          </View>
        </ThemedCard>
      </KeyboardAvoidingView>
      <ConfirmModal {...alertProps} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: SBColors.NEUTRAL_WARM },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: SBSpacing.outerGutter },
  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 12, paddingBottom: SBSpacing.space4,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: SBColors.WHITE, borderWidth: 1, borderColor: SBColors.CERAMIC,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 0.5,
    elevation: 1,
  },
  navTitle: {
    fontSize: 18,
    fontFamily: SBFonts.semibold,
    color: SBColors.STARBUCKS_GREEN,
    letterSpacing: SBType.letterSpacingNormal,
  },
  logoSection: { alignItems: 'center', marginBottom: SBSpacing.space6 },
  logoIcon: { marginBottom: SBSpacing.space3 },
  logoSubtitle: {
    fontSize: 14,
    fontFamily: SBFonts.regular,
    color: SBColors.TEXT_BLACK_SOFT,
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: SBType.letterSpacingNormal,
  },
  field: { marginBottom: SBSpacing.space3 },
  label: {
    fontSize: 13,
    fontFamily: SBFonts.semibold,
    color: SBColors.TEXT_BLACK,
    marginBottom: 6,
    letterSpacing: SBType.letterSpacingNormal,
  },
  input: {
    backgroundColor: SBColors.NEUTRAL_WARM,
    borderRadius: 12,
    paddingHorizontal: SBSpacing.space3,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: SBFonts.regular,
    color: SBColors.TEXT_BLACK,
    borderWidth: 1,
    borderColor: SBColors.CERAMIC,
    letterSpacing: SBType.letterSpacingNormal,
  },
  btnWrapper: {
    marginTop: SBSpacing.space2,
  },
});
