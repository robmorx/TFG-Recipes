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

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email, code } = useLocalSearchParams<{ email: string; code: string }>();
  const { resetPassword, isLoading } = useUserVM();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    try {
      await resetPassword(decodeURIComponent(email), code, newPassword);
      Alert.alert('Contraseña actualizada', 'Tu contraseña ha sido restablecida exitosamente', [
        { text: 'OK', onPress: () => router.replace('/vistas/LoginScreen') },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo restablecer la contraseña');
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
          <Text style={s.logoIcon}>🔒</Text>
          <Text style={s.logoTitle}>Nueva contraseña</Text>
          <Text style={s.logoSubtitle}>
            Ingresa tu nueva contraseña
          </Text>
        </View>

        <View style={s.card}>
          <View style={s.field}>
            <Text style={s.label}>Nueva contraseña</Text>
            <TextInput
              style={s.input}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={C.muted}
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
              placeholderTextColor={C.muted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[s.btn, (!newPassword || !confirmPassword) && s.btnDisabled]}
            onPress={handleReset}
            activeOpacity={0.85}
            disabled={!newPassword || !confirmPassword || isLoading}
          >
            <Text style={s.btnText}>{isLoading ? 'Guardando...' : 'Cambiar contraseña'}</Text>
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
});
