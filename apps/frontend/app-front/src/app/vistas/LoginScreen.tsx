import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/vistas/HomeScreen');
    }, 500);
  };

  const canLogin = email.trim().length > 0 && password.trim().length > 0;

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

          <TouchableOpacity
            style={[s.btn, !canLogin && s.btnDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={!canLogin || isLoading}
          >
            <Text style={s.btnText}>{isLoading ? 'Entrando...' : 'Entrar'}</Text>
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
