import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useUserVM } from '../../presentation/viewmodel/UserVM';
import { ThemedButton, ThemedCard, SBColors, SBSpacing, SBType, SBFonts, hapticLight, useAlert, ConfirmModal } from '../../presentation/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword, isLoading } = useUserVM();
  const [email, setEmail] = useState('');
  const { alertProps, showAlert } = useAlert();

  const handleSendCode = async () => {
    if (!email.trim()) return;
    try {
      await forgotPassword(email.trim());
      router.push(`/vistas/VerifyResetCodeScreen?email=${encodeURIComponent(email.trim())}` as any);
    } catch (error: any) {
      showAlert({ title: 'Error', message: error.message || 'No se encontró la cuenta', singleButton: true });
    }
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={SBColors.NEUTRAL_WARM} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.inner}
      >
        <View style={s.logoSection}>
          <MaterialCommunityIcons name="key-variant" size={56} color={SBColors.STARBUCKS_GREEN} style={s.logoIcon} />
          <Text style={s.logoTitle}>Recuperar contraseña</Text>
          <Text style={s.logoSubtitle}>
            Te enviaremos un código para restablecer tu contraseña
          </Text>
        </View>

        <ThemedCard padding="lg">
          <View style={s.field}>
            <Text style={s.label}>Email</Text>
            <TextInput
              style={s.input}
              placeholder="tu@email.com"
              placeholderTextColor={SBColors.TEXT_BLACK_SOFT}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={s.btnWrapper}>
            <ThemedButton
              variant="primary-filled"
              label={isLoading ? 'Enviando...' : 'Enviar código'}
              onPress={handleSendCode}
              disabled={!email.trim() || isLoading}
              loading={isLoading}
              fullWidth
            />
          </View>

          <TouchableOpacity
            style={s.linkBtn}
            onPress={() => router.back()}
            onPressIn={hapticLight}
          >
            <Text style={s.linkText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </ThemedCard>
      </KeyboardAvoidingView>
      <ConfirmModal {...alertProps} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: SBColors.NEUTRAL_WARM },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: SBSpacing.outerGutter },
  logoSection: { alignItems: 'center', marginBottom: SBSpacing.space6 },
  logoIcon: { marginBottom: SBSpacing.space3 },
  logoTitle: {
    fontSize: 26,
    fontFamily: SBFonts.bold,
    color: SBColors.STARBUCKS_GREEN,
    letterSpacing: SBType.letterSpacingNormal,
  },
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
  linkBtn: { marginTop: SBSpacing.space4, alignItems: 'center' },
  linkText: {
    color: SBColors.GREEN_ACCENT,
    fontSize: 14,
    fontFamily: SBFonts.medium,
    letterSpacing: SBType.letterSpacingNormal,
  },
});
