import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useUserVM } from '../../presentation/viewmodel/UserVM';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedButton, ThemedCard, SBColors, SBSpacing, SBType, SBFonts, useAlert, ConfirmModal } from '../../presentation/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { registerUser, isLoading } = useUserVM();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { alertProps, showAlert } = useAlert();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) return;
    try {
      await registerUser({ name: name.trim(), email: email.trim(), password });
      router.replace(`/vistas/VerifyAccountScreen?email=${encodeURIComponent(email.trim())}` as any);
    } catch (error: any) {
      showAlert({ title: 'Error', message: error.message || 'No se pudo registrar', singleButton: true });
    }
  };

  const canRegister = name.trim().length > 0 && email.trim().length > 0 && password.trim().length > 0;

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={SBColors.NEUTRAL_WARM} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.inner}
      >
         <View style={s.logoSection}>
           <MaterialCommunityIcons name="food-variant" size={56} color={SBColors.STARBUCKS_GREEN} style={s.logoIcon} />
           <Text style={s.logoTitle}>Crear cuenta</Text>
           <Text style={s.logoSubtitle}>Regístrate para empezar</Text>
         </View>

        <ThemedCard padding="lg">
          <View style={s.field}>
            <Text style={s.label}>Nombre</Text>
            <TextInput
              style={s.input}
              placeholder="Tu nombre"
              placeholderTextColor={SBColors.TEXT_BLACK_SOFT}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

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

          <View style={s.field}>
            <Text style={s.label}>Contraseña</Text>
            <TextInput
              style={s.input}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={SBColors.TEXT_BLACK_SOFT}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={s.btnWrapper}>
            <ThemedButton
              variant="primary-filled"
              label={isLoading ? 'Creando...' : 'Crear cuenta'}
              onPress={handleRegister}
              disabled={!canRegister || isLoading}
              loading={isLoading}
              fullWidth
            />
          </View>

          <TouchableOpacity
            style={s.linkBtn}
            onPress={() => router.back()}
          >
            <Text style={s.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
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
