import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform,
  ScrollView, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useInventoryVM } from '../../presentation/viewmodel/InventoryVM';
import { useItemVM } from '../../presentation/viewmodel/ItemVM';
import { useAuth } from '../../presentation/context/AuthContext';
import { Item, QuantityUnit } from '../../domain/entities/item';

const C = {
  bg: '#F5F2EB',
  card: '#FFFFFF',
  cardAlt: '#F0EDE5',
  primary: '#6B8E6B',
  secondary: '#A4C3A2',
  text: '#3D3D3D',
  muted: '#8B8B8B',
  border: '#E0DCD4',
  inputBg: '#F8F6F2',
  danger: '#C97070',
};

const QUANTITY_UNIT_OPTIONS = [
  { value: QuantityUnit.UNITS, label: 'Und' },
  { value: QuantityUnit.LITRES, label: 'L' },
  { value: QuantityUnit.KILOGRAMS, label: 'Kg' },
  { value: QuantityUnit.GRAMS, label: 'g' },
];

export default function InventarioScreen() {
  const router = useRouter();
  const { user } = useAuth();
  console.log('[DEBUG] InventarioScreen - User from useAuth:', user);
  console.log('[DEBUG] InventarioScreen - user_uuid:', user?.user_uuid);
  
  const { inventory, loadInventory, isLoading } = useInventoryVM();
  const { addItem, removeItem } = useItemVM();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState<QuantityUnit>(QuantityUnit.UNITS);
  const [filterUnit, setFilterUnit] = useState<QuantityUnit | 'ALL'>('ALL');
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editQuantity, setEditQuantity] = useState('');
  const [editQuantityUnit, setEditQuantityUnit] = useState<QuantityUnit>(QuantityUnit.UNITS);

  const handleAddItem = async () => {
    const trimmed = name.trim();
    if (!trimmed || !user?.user_uuid) {
      Alert.alert('Error', 'Falta el nombre o el usuario no existe');
      return;
    }
    try {
      await addItem({
        inventory_uuid: user.user_uuid,
        name: trimmed,
        quantity: parseInt(quantity) || 1,
        quantity_unit: quantityUnit,
      });
      setName('');
      setQuantity('');
      setQuantityUnit(QuantityUnit.UNITS);
      await loadInventory(user?.user_uuid || '');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo añadir el artículo');
    }
  };

  const items = inventory?.items || [];
  const filteredItems = filterUnit === 'ALL' 
    ? items 
    : items.filter(item => (item.quantityUnit as string) === filterUnit);

  const handleDeleteItem = async (id: string) => {
    try {
      await removeItem(id);
      await loadInventory(user?.user_uuid || '');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo eliminar el artículo');
    }
  };

  const selectedUnitLabel = QUANTITY_UNIT_OPTIONS.find(u => u.value === quantityUnit)?.label || 'Und';

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={s.container}>

          <View style={s.navbar}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
              <Text style={s.backIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={s.navTitle}>Mi Inventario</Text>
            <View style={{ width: 36 }} />
          </View>

          <View style={s.formCard}>
            <View style={s.field}>
              <Text style={s.label}>Alimento</Text>
              <TextInput
                style={s.input}
                placeholder="Ej: Pollo, Leche, Huevos..."
                placeholderTextColor={C.muted}
                value={name}
                onChangeText={setName}
                returnKeyType="next"
              />
            </View>

            <View style={s.rowFields}>
              <View style={[s.field, { flex: 1, marginRight: 10 }]}>
                <Text style={s.label}>Cantidad</Text>
                <TextInput
                  style={s.input}
                  placeholder="1"
                  placeholderTextColor={C.muted}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              </View>
              <View style={[s.field, { flex: 1 }]}>
                <Text style={s.label}>Unidad</Text>
                <TouchableOpacity
                  style={s.unitPicker}
                  onPress={() => setShowUnitPicker(!showUnitPicker)}
                  activeOpacity={0.7}
                >
                  <Text style={s.unitPickerText}>{selectedUnitLabel}</Text>
                  <Text style={s.unitPickerArrow}>▼</Text>
                </TouchableOpacity>
                {showUnitPicker && (
                  <View style={s.unitDropdown}>
                    {QUANTITY_UNIT_OPTIONS.map(opt => (
                      <TouchableOpacity
                        key={opt.value}
                        style={[s.unitOption, quantityUnit === opt.value && s.unitOptionActive]}
                        onPress={() => {
                          setQuantityUnit(opt.value);
                          setShowUnitPicker(false);
                        }}
                      >
                        <Text style={[s.unitOptionText, quantityUnit === opt.value && s.unitOptionTextActive]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[s.addBtn, !name.trim() && s.addBtnDisabled]}
              onPress={handleAddItem}
              activeOpacity={0.85}
              disabled={!name.trim()}
            >
              <Text style={s.addBtnText}>+ Añadir</Text>
            </TouchableOpacity>
          </View>

          <View style={s.filterSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
              <TouchableOpacity
                style={[s.filterBtn, filterUnit === 'ALL' && s.filterBtnActive]}
                onPress={() => setFilterUnit('ALL')}
              >
                <Text style={[s.filterBtnText, filterUnit === 'ALL' && s.filterBtnTextActive]}>Todos</Text>
              </TouchableOpacity>
              {QUANTITY_UNIT_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[s.filterBtn, filterUnit === opt.value && s.filterBtnActive]}
                  onPress={() => setFilterUnit(opt.value)}
                >
                  <Text style={[s.filterBtnText, filterUnit === opt.value && s.filterBtnTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {isLoading ? (
            <View style={s.loading}>
              <Text style={s.loadingText}>Cargando...</Text>
            </View>
          ) : filteredItems.length > 0 ? (
            <FlatList
              data={filteredItems}
              keyExtractor={item => item.id}
              contentContainerStyle={s.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={s.itemRow}>
                  <View style={[s.itemIcon, { backgroundColor: C.secondary }]}>
                    <Text style={s.itemEmoji}>🥕</Text>
                  </View>
                  <View style={s.itemInfo}>
                    <Text style={s.itemName}>{item.name}</Text>
                    <Text style={s.itemQty}>{item.quantity} {getUnitLabel(item.quantityUnit as QuantityUnit)}</Text>
                  </View>
                  <TouchableOpacity
                    style={s.deleteBtn}
                    onPress={() => handleDeleteItem(item.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={s.deleteIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          ) : (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>🧺</Text>
              <Text style={s.emptyText}>Inventario vacío</Text>
              <Text style={s.emptySub}>Añade los alimentos que tienes</Text>
            </View>
          )}

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getUnitLabel(unit?: QuantityUnit): string {
  if (!unit) return 'und';
  const opt = QUANTITY_UNIT_OPTIONS.find(o => o.value === unit);
  return opt ? opt.label : 'und';
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, paddingHorizontal: 20 },
  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 12, paddingBottom: 16,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 22, color: C.text, lineHeight: 26 },
  navTitle: { fontSize: 18, fontWeight: '600', color: C.text },
  formCard: {
    backgroundColor: C.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: C.border, marginBottom: 16,
  },
  field: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '600', color: C.text, marginBottom: 6 },
  input: {
    backgroundColor: C.inputBg, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: C.text, borderWidth: 1, borderColor: C.border,
  },
  rowFields: { flexDirection: 'row' },
  unitPicker: {
    backgroundColor: C.inputBg, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: C.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  unitPickerText: { fontSize: 14, color: C.text },
  unitPickerArrow: { fontSize: 10, color: C.muted },
  unitDropdown: {
    position: 'absolute', top: 66, left: 0, right: 0,
    backgroundColor: C.card, borderRadius: 10,
    borderWidth: 1, borderColor: C.border,
    zIndex: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  unitOption: { paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  unitOptionActive: { backgroundColor: C.secondary },
  unitOptionText: { fontSize: 14, color: C.text },
  unitOptionTextActive: { color: '#fff', fontWeight: '600' },
  addBtn: {
    backgroundColor: C.primary, borderRadius: 10, paddingVertical: 14,
    alignItems: 'center', marginTop: 4,
  },
  addBtnDisabled: { backgroundColor: C.cardAlt },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  filterSection: { marginBottom: 12 },
  filterScroll: { gap: 8 },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: C.cardAlt, borderWidth: 1, borderColor: C.border,
  },
  filterBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterBtnText: { fontSize: 12, color: C.muted, fontWeight: '500' },
  filterBtnTextActive: { color: '#fff' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 14, color: C.muted },
  list: { gap: 10, paddingBottom: 24 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 12,
    borderWidth: 1, borderColor: C.border,
  },
  itemIcon: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  itemEmoji: { fontSize: 20 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, color: C.text, fontWeight: '500' },
  itemQty: { fontSize: 12, color: C.muted, marginTop: 2 },
  deleteBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.cardAlt, alignItems: 'center', justifyContent: 'center',
  },
  deleteIcon: { fontSize: 10, color: C.danger, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 14 },
  emptyText: { fontSize: 16, fontWeight: '600', color: C.text, marginBottom: 6 },
  emptySub: { fontSize: 13, color: C.muted, textAlign: 'center' },
});
