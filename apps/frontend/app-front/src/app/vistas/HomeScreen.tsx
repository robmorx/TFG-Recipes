import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';

const COLORS = {
  background: '#F5F0E8', card: '#FDFAF4', cardAlt: '#EDE8DF',
  primary: '#3A6EA5', text: '#1C1C1E', textMuted: '#8A8A8E', border: '#E0D9CC',
};

type MenuItemProps = { icon: string; label: string; onPress: () => void };

function MenuItem({ icon, label, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.menuIcon}>
        <Text style={styles.menuEmoji}>{icon}</Text>
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuChevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>

        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Bienvenida,</Text>
            <Text style={styles.userName}>Usuario</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.menuSection}>
          <MenuItem icon="🗂️" label="Inventario" onPress={() => router.push('/vistas/InventarioScreen')} />
          <MenuItem icon="📋" label="Recetas"    onPress={() => router.push('/vistas/RecetasScreen')} />
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push('/vistas/GenerarRecetaScreen')}
            activeOpacity={0.85}
          >
            <Text style={styles.fabIcon}>＋</Text>
          </TouchableOpacity>
          <Text style={styles.fabLabel}>Crear Receta</Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  avatarCircle: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.cardAlt,
    borderWidth: 2, borderColor: COLORS.border, alignItems: 'center',
    justifyContent: 'center', marginRight: 14,
  },
  avatarIcon: { fontSize: 26 },
  headerText: { flex: 1 },
  greeting: { fontSize: 14, color: COLORS.textMuted, fontWeight: '400' },
  userName: { fontSize: 24, fontWeight: '800', color: COLORS.text, letterSpacing: -0.3 },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 24 },
  menuSection: { gap: 12 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    borderRadius: 16, paddingVertical: 18, paddingHorizontal: 20,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  menuIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.cardAlt,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  menuEmoji: { fontSize: 20 },
  menuLabel: { flex: 1, fontSize: 17, fontWeight: '600', color: COLORS.text },
  menuChevron: { fontSize: 22, color: COLORS.textMuted, fontWeight: '300' },
  fabContainer: { alignItems: 'center' },
  fab: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 10, marginBottom: 10,
  },
  fabIcon: { fontSize: 28, color: '#fff', fontWeight: '300', lineHeight: 32 },
  fabLabel: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
});
