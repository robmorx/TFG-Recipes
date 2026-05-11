import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, StatusBar, Alert,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useUserVM } from '../../presentation/viewmodel/UserVM';

const C = {
  bg: '#F5F2EB',
  card: '#FFFFFF',
  primary: '#6B8E6B',
  secondary: '#A4C3A2',
  text: '#3D3D3D',
  muted: '#8B8B8B',
  border: '#E0DCD4',
  inputBg: '#F8F6F2',
  accent: '#D4A574',
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword, isLoading } = useUserVM();
  const [email, setEmail] = useState('');

  const handleSendCode = async () => {
    if (!email.trim()) return;
    try {
      await forgotPassword(email.trim());
      router.push(`/vistas/VerifyResetCodeScreen?email=${encodeURIComponent(email.trim())}` as any);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se encontró la cuenta');
    }
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.inner}
      >
        <View style={s.logoSection}>
          <Text style={s.logoIcon}>🔑</Text>
          <Text style={s.logoTitle}>Recuperar contraseña</Text>
          <Text style={s.logoSubtitle}>
            Te enviaremos un código para restablecer tu contraseña
          </Text>
        </View>

        <View style={s.card}>
          <View style={s.field}>
            <Text style={s.label}>Email</Text>
            <TextInput
              style={s.input}
              placeholder="tu@email.com"
              placeholderTextColor={C.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[s.btn, !email.trim() && s.btnDisabled]}
            onPress={handleSendCode}
            activeOpacity={0.85}
            disabled={!email.trim() || isLoading}
          >
            <Text style={s.btnText}>{isLoading ? 'Enviando...' : 'Enviar código'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.linkBtn}
            onPress={() => router.back()}
          >
            <Text style={s.linkText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoIcon: { fontSize: 56, marginBottom: 12 },
  logoTitle: { fontSize: 26, fontWeight: '700', color: C.text },
  logoSubtitle: { fontSize: 14, color: C.muted, marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: C.border,
  },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 6 },
  input: {
    backgroundColor: C.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: C.text,
    borderWidth: 1,
    borderColor: C.border,
  },
  btn: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { backgroundColor: C.secondary, opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkBtn: { marginTop: 16, alignItems: 'center' },
  linkText: { color: C.primary, fontSize: 14, fontWeight: '500' },
});
