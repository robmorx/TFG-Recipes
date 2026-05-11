import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, StatusBar, Alert,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useUserVM } from '../../presentation/viewmodel/UserVM';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useUserVM();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    try {
      await login(email.trim(), password, rememberMe);
      router.replace('/vistas/HomeScreen');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Credenciales inválidas');
    }
  };

  const canLogin = email.trim().length > 0 && password.trim().length > 0;

  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.inner}
      >
        <View style={s.logoSection}>
          <Text style={s.logoIcon}>🥗</Text>
          <Text style={s.logoTitle}>Mi Cocina</Text>
          <Text style={s.logoSubtitle}>Gestiona tus recetas</Text>
        </View>

        <View style={s.card}>
          <Text style={s.title}>Bienvenido</Text>

          <View style={s.field}>
            <Text style={s.label}>Usuario</Text>
            <TextInput
              style={s.input}
              placeholder="Ingresa tu usuario"
              placeholderTextColor={C.muted}
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
              placeholderTextColor={C.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={s.rememberMeRow} onPress={toggleRememberMe}>
            <View style={[s.checkbox, rememberMe && s.checkboxChecked]}>
              {rememberMe && (
                <MaterialCommunityIcons name="check" size={16} color="#fff" />
              )}
            </View>
            <Text style={s.rememberMeText}>Recordarme</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/vistas/ForgotPasswordScreen' as any)}
          >
            <Text style={s.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.btn, !canLogin && s.btnDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={!canLogin || isLoading}
          >
            <Text style={s.btnText}>{isLoading ? 'Entrando...' : 'Entrar'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={s.registerBtn}
          onPress={() => router.push('/vistas/RegisterScreen' as any)}
        >
          <Text style={s.registerText}>
            ¿No tienes cuenta? <Text style={s.registerHighlight}>Regístrate</Text>
          </Text>
        </TouchableOpacity>
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
  logoSubtitle: { fontSize: 14, color: C.muted, marginTop: 4 },
  card: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: C.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: C.text,
    marginBottom: 20,
    textAlign: 'center',
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
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  rememberMeText: {
    fontSize: 14,
    color: C.text,
    fontWeight: '500',
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
  forgotText: {
    color: C.primary,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 4,
  },
  registerBtn: { marginTop: 24, alignItems: 'center' },
  registerText: { color: C.muted, fontSize: 14 },
  registerHighlight: { color: C.primary, fontWeight: '600' },
});
