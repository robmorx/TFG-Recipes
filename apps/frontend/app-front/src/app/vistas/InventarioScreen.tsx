import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

const COLORS = {
  background: '#F5F0E8', card: '#FDFAF4', cardAlt: '#EDE8DF',
  primary: '#3A6EA5', text: '#1C1C1E', textMuted: '#8A8A8E',
  border: '#E0D9CC', inputBg: '#EFECE4', danger: '#D94F4F',
};

type Item = { id: string; name: string };

export default function InventarioScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [items, setItems] = useState<Item[]>([]);

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setItems(prev => [{ id: Date.now().toString(), name: trimmed }, ...prev]);
    setName('');
  };

  const handleDelete = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>

          <View style={styles.navbar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.navTitle}>Inventario</Text>
            <View style={{ width: 36 }} />
          </View>

          <View style={styles.addCard}>
            <Text style={styles.sectionTitle}>Añadir Alimento</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Pechuga de pollo"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
                returnKeyType="done"
                onSubmitEditing={handleAdd}
              />
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.85}>
              <Text style={styles.addBtnText}>＋ Añadir</Text>
            </TouchableOpacity>
          </View>

          {items.length > 0 && (
            <>
              <Text style={styles.listHeader}>Alimentos ({items.length})</Text>
              <FlatList
                data={items}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.itemRow}>
                    <View style={styles.itemDot} />
                    <Text style={styles.itemName}>{item.name}</Text>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.deleteIcon}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </>
          )}

          {items.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🥦</Text>
              <Text style={styles.emptyText}>Sin alimentos aún.</Text>
              <Text style={styles.emptySubtext}>Añade los ingredientes de tu nevera.</Text>
            </View>
          )}

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 24 },
  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 16, paddingBottom: 20,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.card,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 22, color: COLORS.text, lineHeight: 26 },
  navTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  addCard: {
    backgroundColor: COLORS.card, borderRadius: 20, padding: 22,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3, marginBottom: 24,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 18 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 7 },
  input: {
    backgroundColor: COLORS.inputBg, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border,
  },
  addBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  listHeader: {
    fontSize: 14, fontWeight: '600', color: COLORS.textMuted,
    marginBottom: 10, letterSpacing: 0.3, textTransform: 'uppercase',
  },
  listContent: { gap: 8, paddingBottom: 24 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  itemDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginRight: 12 },
  itemName: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '500' },
  deleteBtn: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: COLORS.cardAlt, alignItems: 'center', justifyContent: 'center',
  },
  deleteIcon: { fontSize: 10, color: COLORS.danger, fontWeight: '700' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 14 },
  emptyText: { fontSize: 17, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  emptySubtext: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
});
