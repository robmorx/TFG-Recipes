import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, StatusBar, Alert,
} from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

export default function VerifyAccountScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyAccount, isLoading } = useUserVM();
  const [code, setCode] = useState('');

  const handleVerify = async () => {
    if (!code.trim() || code.length < 6) return;
    try {
      await verifyAccount(decodeURIComponent(email), code.trim());
      Alert.alert('Cuenta verificada', 'Tu cuenta ha sido verificada exitosamente', [
        { text: 'OK', onPress: () => router.replace('/vistas/LoginScreen') },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Código inválido');
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
          <Text style={s.logoIcon}>📧</Text>
          <Text style={s.logoTitle}>Verifica tu cuenta</Text>
          <Text style={s.logoSubtitle}>
            Hemos enviado un código de 6 dígitos a tu email
          </Text>
        </View>

        <View style={s.card}>
          <View style={s.field}>
            <Text style={s.label}>Código de verificación</Text>
            <TextInput
              style={s.input}
              placeholder="Ingresa el código"
              placeholderTextColor={C.muted}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <TouchableOpacity
            style={[s.btn, code.length < 6 && s.btnDisabled]}
            onPress={handleVerify}
            activeOpacity={0.85}
            disabled={code.length < 6 || isLoading}
          >
            <Text style={s.btnText}>{isLoading ? 'Verificando...' : 'Verificar'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.linkBtn}
            onPress={() => router.replace('/vistas/LoginScreen')}
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
    fontSize: 24,
    color: C.text,
    borderWidth: 1,
    borderColor: C.border,
    textAlign: 'center',
    letterSpacing: 8,
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
