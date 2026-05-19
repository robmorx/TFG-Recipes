import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useUserVM } from '../../presentation/viewmodel/UserVM';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedButton, ThemedCard, SBColors, SBSpacing, SBType, SBFonts, useAlert, ConfirmModal } from '../../presentation/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useUserVM();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { alertProps, showAlert } = useAlert();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    try {
      await login(email.trim(), password);
      router.replace('/vistas/HomeScreen');
    } catch (error: any) {
      showAlert({ title: 'Error', message: error.message || 'Credenciales inválidas', singleButton: true });
    }
  };

  const canLogin = email.trim().length > 0 && password.trim().length > 0;

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={SBColors.NEUTRAL_WARM} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.inner}
      >
        <View style={s.logoSection}>
          <MaterialCommunityIcons name="food-variant" size={56} color={SBColors.STARBUCKS_GREEN} style={s.logoIcon} />
          <Text style={s.logoTitle}>CeroSobras</Text>
          <Text style={s.logoSubtitle}>Gestiona tus recetas</Text>
        </View>

        <ThemedCard padding="lg" style={s.card}>
          <Text style={s.title}>Bienvenido</Text>

          <View style={s.field}>
            <Text style={s.label}>Usuario</Text>
            <TextInput
              style={s.input}
              placeholder="Ingresa tu usuario"
              placeholderTextColor={SBColors.TEXT_BLACK_SOFT}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Contraseña</Text>
            <TextInput
              style={s.input}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor={SBColors.TEXT_BLACK_SOFT}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            onPress={() => router.push('/vistas/ForgotPasswordScreen' as any)}
          >
            <Text style={s.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <View style={s.btnWrapper}>
            <ThemedButton
              variant="primary-filled"
              label={isLoading ? 'Entrando...' : 'Entrar'}
              onPress={handleLogin}
              disabled={!canLogin || isLoading}
              loading={isLoading}
              fullWidth
            />
          </View>
        </ThemedCard>

        <TouchableOpacity
          style={s.registerBtn}
          onPress={() => router.push('/vistas/RegisterScreen' as any)}
        >
          <Text style={s.registerText}>
            ¿No tienes cuenta? <Text style={s.registerHighlight}>Regístrate</Text>
          </Text>
        </TouchableOpacity>
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
    letterSpacing: SBType.letterSpacingNormal,
  },
  card: {
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.24,
    shadowRadius: 1,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontFamily: SBFonts.semibold,
    color: SBColors.STARBUCKS_GREEN,
    marginBottom: SBSpacing.space5,
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
  forgotText: {
    color: SBColors.GREEN_ACCENT,
    fontSize: 13,
    fontFamily: SBFonts.medium,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: SBSpacing.space3,
    letterSpacing: SBType.letterSpacingNormal,
  },
  btnWrapper: {
    marginTop: SBSpacing.space2,
  },
  registerBtn: { marginTop: SBSpacing.space6, alignItems: 'center' },
  registerText: {
    color: SBColors.TEXT_BLACK_SOFT,
    fontSize: 14,
    fontFamily: SBFonts.regular,
    letterSpacing: SBType.letterSpacingNormal,
  },
  registerHighlight: {
    color: SBColors.GREEN_ACCENT,
    fontFamily: SBFonts.semibold,
  },
});
