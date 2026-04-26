import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { useEffect } from 'react';
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
  accent: '#D4A574',
};

type MenuItemProps = {
  icon: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
};

function MenuItem({ icon, label, subtitle, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity style={s.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={s.menuIconBox}>
        <Text style={s.menuEmoji}>{icon}</Text>
      </View>
      <View style={s.menuText}>
        <Text style={s.menuLabel}>{label}</Text>
        {subtitle && <Text style={s.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Text style={s.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, loadUser } = useUserVM();

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <View style={s.container}>

        <View style={s.header}>
          <View style={s.avatar}>
            <Text style={s.avatarIcon}>👩‍🍳</Text>
          </View>
          <View style={s.headerText}>
            <Text style={s.greeting}>Hola!</Text>
            <Text style={s.userName}>{user?.name || 'Usuario'}</Text>
          </View>
        </View>

        <View style={s.welcomeCard}>
          <Text style={s.welcomeTitle}>¿Qué vas a cocinar hoy?</Text>
          <Text style={s.welcomeSub}>Gestiona tu cocina fácilmente</Text>
        </View>

        <View style={s.menuSection}>
          <MenuItem
            icon="🥕"
            label="Inventario"
            subtitle="Ver tus ingredientes"
            onPress={() => router.push('/vistas/InventarioScreen')}
          />
          <MenuItem
            icon="📖"
            label="Mis Recetas"
            subtitle="Explorar recetas"
            onPress={() => router.push('/vistas/RecetasScreen')}
          />
        </View>

        <View style={s.fabWrapper}>
          <TouchableOpacity
            style={s.fab}
            onPress={() => router.push('/vistas/CrearRecetaScreen')}
            activeOpacity={0.8}
          >
            <Text style={s.fabIcon}>+</Text>
          </TouchableOpacity>
          <Text style={s.fabLabel}>Nueva Receta</Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: { fontSize: 24 },
  headerText: { flex: 1 },
  greeting: { fontSize: 14, color: C.muted },
  userName: { fontSize: 20, fontWeight: '600', color: C.text },
  welcomeCard: {
    backgroundColor: C.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  welcomeTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 4 },
  welcomeSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  menuSection: { gap: 12 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8F6F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuEmoji: { fontSize: 22 },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 16, fontWeight: '600', color: C.text },
  menuSubtitle: { fontSize: 12, color: C.muted, marginTop: 2 },
  menuArrow: { fontSize: 20, color: C.muted },
  fabWrapper: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 8,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: { fontSize: 28, color: '#fff', fontWeight: '300' },
  fabLabel: { fontSize: 12, color: C.muted, fontWeight: '500' },
});
