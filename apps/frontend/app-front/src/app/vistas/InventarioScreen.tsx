import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, StatusBar, KeyboardAvoidingView, Platform,
  ScrollView, Modal, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useInventoryVM } from '../../presentation/viewmodel/InventoryVM';
import { useItemVM } from '../../presentation/viewmodel/ItemVM';
import { useAuth } from '../../presentation/context/AuthContext';
import { Item, QuantityUnit } from '../../domain/entities/item';
import { ThemedButton, ThemedCard, SBColors, SBSpacing, SBRadius, SBType, SBFonts, hapticLight, useAlert, ConfirmModal } from '../../presentation/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const QUANTITY_UNIT_OPTIONS = [
  { value: QuantityUnit.UNITS, label: 'Und' },
  { value: QuantityUnit.LITRES, label: 'L' },
  { value: QuantityUnit.KILOGRAMS, label: 'Kg' },
  { value: QuantityUnit.GRAMS, label: 'g' },
];

const COMMON_FOODS = [
  { id: '1', name: 'Tomate', image: require('../../../assets/images/foods/tomate.png'), defaultUnit: QuantityUnit.UNITS },
  { id: '2', name: 'Leche', image: require('../../../assets/images/foods/leche.png'), defaultUnit: QuantityUnit.LITRES },
  { id: '3', name: 'Huevos', image: require('../../../assets/images/foods/huevos.png'), defaultUnit: QuantityUnit.UNITS },
  { id: '4', name: 'Manzana', image: require('../../../assets/images/foods/manzana.png'), defaultUnit: QuantityUnit.UNITS },
  { id: '5', name: 'Pollo', image: require('../../../assets/images/foods/pollo.png'), defaultUnit: QuantityUnit.KILOGRAMS },
  { id: '6', name: 'Pan', image: require('../../../assets/images/foods/pan.png'), defaultUnit: QuantityUnit.UNITS },
];

const getFoodImage = (name: string) => {
  const food = COMMON_FOODS.find(f => f.name.toLowerCase() === name.toLowerCase().trim());
  return food ? food.image : null;
};

function AnimatedBackBtn({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={onPress}
      style={[s.backBtn, animatedStyle]}
      activeOpacity={0.95}
      onPressIn={() => {
        scale.value = withTiming(0.95, { duration: 100 });
        hapticLight();
      }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 200 }); }}
    >
      <MaterialCommunityIcons name="chevron-left" size={28} color={SBColors.TEXT_BLACK} />
    </AnimatedTouchable>
  );
}

function AnimatedFilterBtn({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      style={[s.filterBtn, active && s.filterBtnActive, animatedStyle]}
      onPress={onPress}
      activeOpacity={0.95}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 100 });
        hapticLight();
      }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 200 }); }}
    >
      <Text style={[s.filterBtnText, active && s.filterBtnTextActive]}>{label}</Text>
    </AnimatedTouchable>
  );
}

function AnimatedItemRow({
  item,
  onEdit,
  onDelete,
}: {
  item: Item;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const foodImage = getFoodImage(item.name);

  return (
    <View style={[s.itemRow, animatedStyle]}>
      <View style={[s.itemIcon, foodImage && { backgroundColor: 'transparent' }]}>
        {foodImage ? (
          <Image source={foodImage} style={s.rowImage} />
        ) : (
          <MaterialCommunityIcons name="carrot" size={22} color={SBColors.GREEN_ACCENT} />
        )}
      </View>
      <View style={s.itemInfo}>
        <Text style={s.itemName}>{item.name}</Text>
        <Text style={s.itemQty}>{formatQuantity(item.quantity, item.quantityUnit as QuantityUnit)}</Text>
      </View>
      <TouchableOpacity
        style={s.editBtn}
        onPress={onEdit}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPressIn={hapticLight}
      >
        <MaterialCommunityIcons name="pencil-outline" size={18} color={SBColors.GREEN_ACCENT} />
      </TouchableOpacity>
      <TouchableOpacity
        style={s.deleteBtn}
        onPress={onDelete}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPressIn={hapticLight}
      >
        <MaterialCommunityIcons name="close" size={18} color={SBColors.RED} />
      </TouchableOpacity>
    </View>
  );
}

export default function InventarioScreen() {
  const router = useRouter();
  const { user } = useAuth();
  console.log('[DEBUG] InventarioScreen - User from useAuth:', user);
  console.log('[DEBUG] InventarioScreen - user_uuid:', user?.user_uuid);

  const { inventory, loadInventory, isLoading } = useInventoryVM();
  const { addItem, removeItem, editItem } = useItemVM();

  useFocusEffect(
    useCallback(() => {
      loadInventory();
    }, [loadInventory])
  );
  const { alertProps, showAlert } = useAlert();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState<QuantityUnit>(QuantityUnit.UNITS);
  const [filterUnit, setFilterUnit] = useState<QuantityUnit | 'ALL'>('ALL');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editQuantity, setEditQuantity] = useState('');
  const [editQuantityUnit, setEditQuantityUnit] = useState<QuantityUnit>(QuantityUnit.UNITS);

  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [selectedCommonFood, setSelectedCommonFood] = useState<any>(null);
  const [quickAddQuantity, setQuickAddQuantity] = useState('1');
  const [quickAddUnit, setQuickAddUnit] = useState<QuantityUnit>(QuantityUnit.UNITS);

  const handleCloseQuickAdd = () => {
    setShowQuickAddModal(false);
    setSelectedCommonFood(null);
  };

  const handleConfirmQuickAdd = async () => {
    if (!selectedCommonFood || !user?.user_uuid) return;
    try {
      await addItem({
        inventory_uuid: user.user_uuid,
        name: selectedCommonFood.name,
        quantity: parseInt(quickAddQuantity) || 1,
        quantity_unit: quickAddUnit,
      });
      setShowQuickAddModal(false);
      setSelectedCommonFood(null);
      await loadInventory();
      showAlert({ title: 'Éxito', message: `${selectedCommonFood.name} añadido`, singleButton: true });
    } catch (error: any) {
      showAlert({ title: 'Error', message: error.message || 'No se pudo añadir', singleButton: true });
    }
  };

  const handleAddItem = async () => {
    const trimmed = name.trim();
    if (!trimmed || !user?.user_uuid) {
      showAlert({ title: 'Error', message: 'Falta el nombre o el usuario no existe', singleButton: true });
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
      await loadInventory();
    } catch (error: any) {
      showAlert({ title: 'Error', message: error.message || 'No se pudo añadir el artículo', singleButton: true });
    }
  };

  const items = inventory?.items || [];
  const filteredItems = filterUnit === 'ALL'
    ? items
    : items.filter(item => (item.quantityUnit as string) === filterUnit);

  const handleDeleteItem = async (id: string) => {
    try {
      await removeItem(id);
      await loadInventory();
    } catch (error: any) {
      showAlert({ title: 'Error', message: error.message || 'No se pudo eliminar el artículo', singleButton: true });
    }
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setEditQuantity(item.quantity.toString());
    setEditQuantityUnit(item.quantityUnit as QuantityUnit);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !user?.user_uuid) return;
    try {
      await editItem({
        ...editingItem,
        quantity: parseInt(editQuantity) || editingItem.quantity,
        quantityUnit: editQuantityUnit,
      });
      setShowEditModal(false);
      setEditingItem(null);
      await loadInventory();
    } catch (error: any) {
      showAlert({ title: 'Error', message: error.message || 'No se pudo actualizar el artículo', singleButton: true });
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingItem(null);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={SBColors.NEUTRAL_WARM} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={s.container}>

          <View style={s.navbar}>
            <AnimatedBackBtn onPress={() => router.back()} />
            <Text style={s.navTitle}>Mi Inventario</Text>
            <View style={{ width: 36 }} />
          </View>

          <ThemedCard padding="md" style={s.formCard}>
            <View style={s.field}>
              <Text style={s.label}>Alimento</Text>
              <TextInput
                style={s.input}
                placeholder="Ej: Pollo, Leche, Huevos..."
                placeholderTextColor={SBColors.TEXT_BLACK_SOFT}
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
                  placeholderTextColor={SBColors.TEXT_BLACK_SOFT}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              </View>

              <View style={[s.field, { flex: 1 }]}>
                <Text style={s.label}>Unidad</Text>
                <View style={s.unitChipRow}>
                  {QUANTITY_UNIT_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[s.unitChip, quantityUnit === opt.value && s.unitChipActive]}
                      onPress={() => {
                        setQuantityUnit(opt.value);
                        hapticLight();
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[s.unitChipText, quantityUnit === opt.value && s.unitChipTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <ThemedButton
              variant="primary-filled"
              label="+ Añadir"
              onPress={handleAddItem}
              disabled={!name.trim()}
              fullWidth
              style={s.addBtn}
            />
            <ThemedButton
              variant="secondary-outline"
              label="Añadir rápido (Imágenes)"
              onPress={() => setShowQuickAddModal(true)}
              fullWidth
              style={s.quickAddBtn}
            />
          </ThemedCard>

          <View style={s.filterSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
              <AnimatedFilterBtn
                label="Todos"
                active={filterUnit === 'ALL'}
                onPress={() => setFilterUnit('ALL')}
              />
              {QUANTITY_UNIT_OPTIONS.map(opt => (
                <AnimatedFilterBtn
                  key={opt.value}
                  label={opt.label}
                  active={filterUnit === opt.value}
                  onPress={() => setFilterUnit(opt.value)}
                />
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
                <AnimatedItemRow
                  item={item}
                  onEdit={() => handleEditItem(item)}
                  onDelete={() => handleDeleteItem(item.id)}
                />
              )}
            />
          ) : (
            <View style={s.empty}>
              <MaterialCommunityIcons name="basket-outline" size={52} color={SBColors.GREEN_ACCENT} style={s.emptyIcon} />
              <Text style={s.emptyText}>Inventario vacío</Text>
              <Text style={s.emptySub}>Añade los alimentos que tienes</Text>
            </View>
          )}

        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={s.modalOverlay}>
          <ThemedCard padding="lg" style={s.modalCard}>
            <Text style={s.modalTitle}>Editar Artículo</Text>
            <Text style={s.modalItemName}>{editingItem?.name}</Text>

            <View style={s.modalField}>
              <Text style={s.label}>Cantidad</Text>
              <TextInput
                style={s.input}
                value={editQuantity}
                onChangeText={setEditQuantity}
                keyboardType="numeric"
              />
            </View>

            <View style={s.modalField}>
              <Text style={s.label}>Unidad</Text>
              <View style={s.unitChipRow}>
                {QUANTITY_UNIT_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[s.unitChip, editQuantityUnit === opt.value && s.unitChipActive]}
                    onPress={() => {
                      setEditQuantityUnit(opt.value);
                      hapticLight();
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.unitChipText, editQuantityUnit === opt.value && s.unitChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancelBtn} onPress={handleCloseModal}>
                <Text style={s.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <ThemedButton
                variant="primary-filled"
                label="Guardar"
                onPress={handleSaveEdit}
                fullWidth={false}
                style={s.modalSaveBtn}
              />
            </View>
          </ThemedCard>
        </View>
      </Modal>

      <Modal
        visible={showQuickAddModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseQuickAdd}
      >
        <View style={s.modalOverlay}>
          <ThemedCard padding="lg" style={s.quickAddModalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Añadir Rápido</Text>
              <TouchableOpacity onPress={handleCloseQuickAdd}>
                <MaterialCommunityIcons name="close" size={24} color={SBColors.TEXT_BLACK_SOFT} />
              </TouchableOpacity>
            </View>

            {!selectedCommonFood ? (
              <ScrollView showsVerticalScrollIndicator={false} style={s.foodsScroll}>
                <View style={s.foodsGrid}>
                  {COMMON_FOODS.map(food => (
                    <TouchableOpacity
                      key={food.id}
                      style={s.foodGridItem}
                      onPress={() => {
                        setSelectedCommonFood(food);
                        setQuickAddQuantity('1');
                        setQuickAddUnit(food.defaultUnit);
                        hapticLight();
                      }}
                      activeOpacity={0.8}
                    >
                      <Image source={food.image} style={s.foodImage} />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <View>
                <View style={s.selectedFoodHeader}>
                  <Image source={selectedCommonFood.image} style={s.selectedFoodImage} />
                  <Text style={s.selectedFoodTitle}>{selectedCommonFood.name}</Text>
                </View>

                <View style={s.modalField}>
                  <Text style={s.label}>Cantidad</Text>
                  <TextInput
                    style={s.input}
                    value={quickAddQuantity}
                    onChangeText={setQuickAddQuantity}
                    keyboardType="numeric"
                    returnKeyType="done"
                  />
                </View>

                <View style={s.modalField}>
                  <Text style={s.label}>Unidad</Text>
                  <View style={s.unitChipRow}>
                    {QUANTITY_UNIT_OPTIONS.map(opt => (
                      <TouchableOpacity
                        key={opt.value}
                        style={[s.unitChip, quickAddUnit === opt.value && s.unitChipActive]}
                        onPress={() => {
                          setQuickAddUnit(opt.value);
                          hapticLight();
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={[s.unitChipText, quickAddUnit === opt.value && s.unitChipTextActive]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={s.modalActions}>
                  <TouchableOpacity
                    style={s.modalCancelBtn}
                    onPress={() => setSelectedCommonFood(null)}
                  >
                    <Text style={s.modalCancelText}>Volver</Text>
                  </TouchableOpacity>
                  <ThemedButton
                    variant="primary-filled"
                    label="Añadir"
                    onPress={handleConfirmQuickAdd}
                    fullWidth={false}
                    style={s.modalSaveBtn}
                  />
                </View>
              </View>
            )}
          </ThemedCard>
        </View>
      </Modal>

      <ConfirmModal {...alertProps} />
    </SafeAreaView>
  );
}

function formatQuantity(quantity: number, unit?: QuantityUnit): string {
  if (!unit) return `${quantity} ud`;
  switch (unit) {
    case QuantityUnit.UNITS: return `${quantity} ud`;
    case QuantityUnit.LITRES: return `${quantity} L`;
    case QuantityUnit.KILOGRAMS: return `${quantity} kg`;
    case QuantityUnit.GRAMS: return `${quantity} g`;
    default: return `${quantity} ud`;
  }
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SBColors.NEUTRAL_WARM },
  container: { flex: 1, paddingHorizontal: SBSpacing.outerGutter },
  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 12, paddingBottom: SBSpacing.space4,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: SBColors.WHITE, borderWidth: 1, borderColor: SBColors.CERAMIC,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 0.5,
    elevation: 1,
  },
  navTitle: {
    fontSize: 18,
    fontFamily: SBFonts.semibold,
    color: SBColors.STARBUCKS_GREEN,
    letterSpacing: SBType.letterSpacingNormal,
  },
  formCard: {
    marginBottom: SBSpacing.space4,
  },
  field: { marginBottom: SBSpacing.space3 },
  label: {
    fontSize: 12,
    fontFamily: SBFonts.semibold,
    color: SBColors.TEXT_BLACK,
    marginBottom: 6,
    letterSpacing: SBType.letterSpacingNormal,
  },
  input: {
    backgroundColor: SBColors.NEUTRAL_WARM,
    borderRadius: 12,
    paddingHorizontal: SBSpacing.space3,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: SBFonts.regular,
    color: SBColors.TEXT_BLACK,
    borderWidth: 1,
    borderColor: SBColors.CERAMIC,
    letterSpacing: SBType.letterSpacingNormal,
  },
  rowFields: { flexDirection: 'row' },
  unitChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
    minHeight: 44,
  },
  unitChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: SBColors.NEUTRAL_WARM,
    borderWidth: 1,
    borderColor: SBColors.CERAMIC,
  },
  unitChipActive: {
    backgroundColor: SBColors.GREEN_ACCENT,
    borderColor: SBColors.GREEN_ACCENT,
  },
  unitChipText: {
    fontSize: 13,
    fontFamily: SBFonts.regular,
    color: SBColors.TEXT_BLACK,
    letterSpacing: SBType.letterSpacingNormal,
  },
  unitChipTextActive: {
    color: SBColors.WHITE,
    fontFamily: SBFonts.medium,
  },
  addBtn: {
    marginTop: 4,
  },
  filterSection: { marginBottom: SBSpacing.space3 },
  filterScroll: { gap: 8 },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: SBColors.NEUTRAL_WARM,
    borderWidth: 1,
    borderColor: SBColors.CERAMIC,
  },
  filterBtnActive: { backgroundColor: SBColors.GREEN_ACCENT, borderColor: SBColors.GREEN_ACCENT },
  filterBtnText: {
    fontSize: 12,
    fontFamily: SBFonts.medium,
    color: SBColors.TEXT_BLACK_SOFT,
    letterSpacing: SBType.letterSpacingNormal,
  },
  filterBtnTextActive: { color: SBColors.WHITE },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: {
    fontSize: 14,
    fontFamily: SBFonts.regular,
    color: SBColors.TEXT_BLACK_SOFT,
    letterSpacing: SBType.letterSpacingNormal,
  },
  list: { gap: 10, paddingBottom: 24 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: SBColors.WHITE,
    borderRadius: SBRadius.card,
    paddingVertical: 12, paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.24,
    shadowRadius: 1,
    elevation: 2,
  },
  itemIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: SBColors.GREEN_LIGHT,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: 15, color: SBColors.TEXT_BLACK, fontFamily: SBFonts.medium,
    letterSpacing: SBType.letterSpacingNormal,
  },
  itemQty: {
    fontSize: 12, color: SBColors.TEXT_BLACK_SOFT, marginTop: 2,
    fontFamily: SBFonts.regular,
    letterSpacing: SBType.letterSpacingNormal,
  },
  deleteBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: SBColors.NEUTRAL_WARM, alignItems: 'center', justifyContent: 'center',
  },
  editBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: SBColors.NEUTRAL_WARM, alignItems: 'center', justifyContent: 'center',
    marginRight: 6,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  emptyIcon: { marginBottom: 14 },
  emptyText: {
    fontSize: 16, fontFamily: SBFonts.semibold, color: SBColors.TEXT_BLACK, marginBottom: 6,
    letterSpacing: SBType.letterSpacingNormal,
  },
  emptySub: {
    fontSize: 13, color: SBColors.TEXT_BLACK_SOFT, textAlign: 'center',
    fontFamily: SBFonts.regular,
    letterSpacing: SBType.letterSpacingNormal,
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%', maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18, fontFamily: SBFonts.semibold, color: SBColors.STARBUCKS_GREEN, marginBottom: 4,
    letterSpacing: SBType.letterSpacingNormal,
  },
  modalItemName: {
    fontSize: 14, color: SBColors.TEXT_BLACK_SOFT, marginBottom: 20,
    fontFamily: SBFonts.regular,
    letterSpacing: SBType.letterSpacingNormal,
  },
  modalField: { marginBottom: SBSpacing.space4 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 50,
    backgroundColor: SBColors.NEUTRAL_WARM, alignItems: 'center',
    borderWidth: 1, borderColor: SBColors.CERAMIC,
  },
  modalCancelText: {
    fontSize: 15, color: SBColors.TEXT_BLACK, fontFamily: SBFonts.medium,
    letterSpacing: SBType.letterSpacingNormal,
  },
  modalSaveBtn: {
    flex: 1,
  },
  quickAddBtn: {
    marginTop: 8,
  },
  quickAddModalCard: {
    width: '100%', maxWidth: 400, maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  foodsScroll: {
    maxHeight: 400,
  },
  foodsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '5%',
  },
  foodGridItem: {
    width: '30%', aspectRatio: 1, marginBottom: 16,
  },
  foodImage: {
    width: '100%', height: '100%', borderRadius: 16,
  },
  rowImage: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: SBColors.WHITE, borderWidth: 1, borderColor: SBColors.CERAMIC,
  },
  selectedFoodHeader: {
    alignItems: 'center', marginBottom: 20,
  },
  selectedFoodImage: {
    width: 80, height: 80, borderRadius: 40, marginBottom: 12, backgroundColor: SBColors.WHITE,
  },
  selectedFoodTitle: {
    fontSize: 20, fontFamily: SBFonts.semibold, color: SBColors.STARBUCKS_GREEN,
  },
});