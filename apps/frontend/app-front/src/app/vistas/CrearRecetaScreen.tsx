import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, KeyboardAvoidingView, Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useRecipeVM } from '../../presentation/viewmodel/RecipeVM';
import { RecipeCreateRequestDTO } from '../../domain/dto/recipe.create.request.dto';
import { RecipeType } from '../../domain/entities/recipe';
import { QuantityUnit } from '../../domain/entities/item';
import { useInventoryVM } from '../../presentation/viewmodel/InventoryVM';
import { useItemVM } from '../../presentation/viewmodel/ItemVM';
import { useAuth } from '../../presentation/context/AuthContext';
import { ThemedButton, ThemedCard, SBColors, SBSpacing, SBType, SBFonts, hapticLight, useAlert, ConfirmModal } from '../../presentation/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type RecipeTypeOption = {
  value: RecipeType;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

const RECIPE_TYPE_OPTIONS: RecipeTypeOption[] = [
  { value: RecipeType.BREAKFAST, label: 'Desayuno', icon: 'weather-sunset-up' },
  { value: RecipeType.LUNCH, label: 'Comida', icon: 'weather-sunny' },
  { value: RecipeType.DINNER, label: 'Cena', icon: 'weather-night' },
];

const QUANTITY_UNIT_OPTIONS = [
  { value: QuantityUnit.UNITS, label: 'Und' },
  { value: QuantityUnit.LITRES, label: 'L' },
  { value: QuantityUnit.KILOGRAMS, label: 'Kg' },
  { value: QuantityUnit.GRAMS, label: 'g' },
];

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetariano' },
  { id: 'vegan', label: 'Vegano' },
  { id: 'gluten-free', label: 'Sin gluten' },
  { id: 'dairy-free', label: 'Sin lácteos' },
  { id: 'nut-free', label: 'Sin frutos secos' },
  { id: 'low-carb', label: 'Bajo en carbohidratos' },
];

type IngredientOption = { id: string; name: string; selected: boolean; quantity?: number; quantityUnit?: string };

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

export default function CrearRecetaScreen() {
  const router = useRouter();
  const { addRecipe } = useRecipeVM();
  const { inventory, loadInventory } = useInventoryVM();
  const { addItem } = useItemVM();
  const { user } = useAuth();
  const { alertProps, showAlert } = useAlert();
  const [recipeType, setRecipeType] = useState<RecipeType>(RecipeType.DINNER);
  const [quantity, setQuantity] = useState('4');
  const [ingredients, setIngredients] = useState<IngredientOption[]>([]);
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState<QuantityUnit>(QuantityUnit.UNITS);

  useEffect(() => {
    if (inventory?.items) {
      setIngredients(
        inventory.items.map(item => ({
          id: item.id,
          name: item.name,
          selected: false,
          quantity: item.quantity,
          quantityUnit: item.quantityUnit,
        }))
      );
    }
  }, [inventory]);

  const toggle = (id: string) =>
    setIngredients(prev => prev.map(it => it.id === id ? { ...it, selected: !it.selected } : it));

  const toggleDietary = (id: string) => {
    setDietaryPrefs(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleAddToInventory = async () => {
    const trimmedName = newItemName.trim();
    if (!trimmedName || !user?.user_uuid) {
      showAlert({ title: 'Error', message: 'Falta el nombre del alimento', singleButton: true });
      return;
    }

    try {
      console.log('[CrearRecetaScreen] Adding item to inventory:', trimmedName);
      await addItem({
        inventory_uuid: user.user_uuid,
        name: trimmedName,
        quantity: parseInt(newItemQty) || 1,
        quantity_unit: newItemUnit,
      });

      setNewItemName('');
      setNewItemQty('1');
      setNewItemUnit(QuantityUnit.UNITS);
      setShowAddItemModal(false);

      await loadInventory();
      console.log('[CrearRecetaScreen] Item added successfully, inventory reloaded');
    } catch (error: any) {
      console.error('[CrearRecetaScreen] Error adding item:', error);
      showAlert({ title: 'Error', message: error.message || 'No se pudo añadir el artículo', singleButton: true });
    }
  };

  const handleSave = async () => {
    setIsGenerating(true);

    const selectedIngredients = ingredients
      .filter(i => i.selected)
      .map(i => {
        if (i.quantity && i.quantityUnit) {
          return `${i.quantity} ${i.quantityUnit} of ${i.name}`;
        }
        return i.name;
      });

    const dietaryText = dietaryPrefs.length > 0
      ? `Dietary preferences: ${dietaryPrefs.join(', ')}.`
      : '';

    const prompt = `
      Generate a ${RECIPE_TYPE_OPTIONS.find(o => o.value === recipeType)?.label || 'recipe'} recipe for ${quantity} people.
      ${dietaryText}
      Use ONLY these ingredients from my inventory: ${selectedIngredients.join(', ')}.
      Do not use any ingredients that are not listed above.
      IMPORTANT: You MUST generate a creative and descriptive name for the recipe. The "name" field cannot be empty.
      Create a recipe name, list of ingredients with quantities, and step-by-step instructions.
      For steps that require timing (baking, cooking, resting), include timerMinutes in the response.
      Return ONLY valid JSON: {"name": "string", "ingredients": ["string"], "steps": [{"instruction": "string", "timerMinutes": number}]}
      No additional text.
    `.trim();

    const request: RecipeCreateRequestDTO = {
      prompt,
      type: recipeType,
      user_uuid: user?.user_uuid || 'user-001',
      servings: parseInt(quantity) || 4,
      dietaryPreferences: dietaryPrefs,
      selectedIngredients,
    };

    try {
      const newRecipe = await addRecipe(request);
      router.replace(`/vistas/RecetaDetalleScreen?id=${newRecipe.recipe_uuid}`);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Error al generar la receta';
      showAlert({ title: 'Límite alcanzado', message, singleButton: true });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedCount = ingredients.filter(i => i.selected).length;
  const isSuperUser = user?.role === 'SUPERUSER';
  const dailyCount = user?.dailyRecipeCount ?? 0;
  const dailyLimit = user?.dailyRecipeLimit ?? 2;
  const limitReached = !isSuperUser && dailyCount >= dailyLimit;
  const canSave = selectedCount > 0 && !limitReached;

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
            <Text style={s.navTitle}>Nueva Receta</Text>
            <View style={{ width: 36 }} />
          </View>

          {!isSuperUser && (
            <View style={s.usageBanner}>
              <MaterialCommunityIcons
                name={limitReached ? 'close-circle' : 'check-circle'}
                size={18}
                color={limitReached ? SBColors.RED : SBColors.GREEN_ACCENT}
              />
              <Text style={[s.usageText, limitReached && s.usageTextLimit]}>
                {limitReached
                  ? `Límite diario alcanzado (${dailyCount}/${dailyLimit})`
                  : `Recetas hoy: ${dailyCount}/${dailyLimit}`}
              </Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

            <ThemedCard padding="md" style={s.formCard}>
              <View style={s.field}>
                <Text style={s.label}>Tipo</Text>
                <View style={s.typeSelector}>
                  {RECIPE_TYPE_OPTIONS.map(opt => (
                    <TypeButton
                      key={opt.value}
                      icon={opt.icon}
                      label={opt.label}
                      active={recipeType === opt.value}
                      onPress={() => setRecipeType(opt.value)}
                    />
                  ))}
                </View>
              </View>

              <View style={s.field}>
                <Text style={s.label}>Personas</Text>
                <TextInput
                  style={s.input}
                  placeholder="4"
                  placeholderTextColor={SBColors.TEXT_BLACK_SOFT}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                />
              </View>
            </ThemedCard>

            <ThemedCard padding="md" style={s.sectionCard}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Preferencias dietéticas</Text>
                <Text style={s.sectionCount}>{dietaryPrefs.length} seleccionadas</Text>
              </View>
              <View style={s.preferencesGrid}>
                {DIETARY_OPTIONS.map(opt => (
                  <ChipButton
                    key={opt.id}
                    label={opt.label}
                    active={dietaryPrefs.includes(opt.id)}
                    onPress={() => toggleDietary(opt.id)}
                  />
                ))}
              </View>
            </ThemedCard>

            <ThemedCard padding="md" style={s.sectionCard}>
              <View style={s.sectionHeader}>
                <View style={s.sectionHeaderLeft}>
                  <Text style={s.sectionTitle}>Ingredientes</Text>
                  <Text style={s.sectionCount}>{selectedCount} seleccionados</Text>
                </View>
                <TouchableOpacity
                  style={s.addItemBtn}
                  onPress={() => setShowAddItemModal(true)}
                  onPressIn={hapticLight}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="plus-circle-outline" size={24} color={SBColors.GREEN_ACCENT} />
                </TouchableOpacity>
              </View>

              <View style={s.ingredientsGrid}>
                {ingredients.map(item => (
                  <ChipButton
                    key={item.id}
                    label={
                      item.quantity && item.quantityUnit
                        ? `${item.quantity} ${item.quantityUnit} ${item.name}`
                        : item.name
                    }
                    active={item.selected}
                    onPress={() => toggle(item.id)}
                  />
                ))}
              </View>
            </ThemedCard>

            <ThemedButton
              variant="primary-filled"
              label={isGenerating ? 'Generando...' : 'Generar Receta'}
              onPress={handleSave}
              disabled={!canSave || isGenerating}
              loading={isGenerating}
              fullWidth
            />

          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showAddItemModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddItemModal(false)}
      >
        <View style={s.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowAddItemModal(false)}
          />
          <View
            style={s.modalContentContainer}
            onStartShouldSetResponder={() => true}
          >
            <ThemedCard padding="lg" style={s.modalCard}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Añadir a Inventario</Text>
                <TouchableOpacity
                  onPress={() => setShowAddItemModal(false)}
                  onPressIn={hapticLight}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="close" size={24} color={SBColors.TEXT_BLACK_SOFT} />
                </TouchableOpacity>
              </View>

              <View style={s.modalField}>
                <Text style={s.modalLabel}>Nombre del alimento</Text>
                <TextInput
                  style={s.modalInput}
                  placeholder="Ej: Pollo, Leche, Huevos..."
                  placeholderTextColor={SBColors.TEXT_BLACK_SOFT}
                  value={newItemName}
                  onChangeText={setNewItemName}
                  autoCapitalize="words"
                />
              </View>

              <View style={s.modalRowFields}>
                <View style={[s.modalField, { flex: 1, marginRight: 10 }]}>
                  <Text style={s.modalLabel}>Cantidad</Text>
                  <TextInput
                    style={s.modalInput}
                    placeholder="1"
                    placeholderTextColor={SBColors.TEXT_BLACK_SOFT}
                    value={newItemQty}
                    onChangeText={setNewItemQty}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[s.modalField, { flex: 1 }]}>
                  <Text style={s.modalLabel}>Unidad</Text>
                  <View style={s.unitChipRow}>
                    {QUANTITY_UNIT_OPTIONS.map(opt => (
                      <TouchableOpacity
                        key={opt.value}
                        style={[s.unitChip, newItemUnit === opt.value && s.unitChipActive]}
                        onPress={() => {
                          setNewItemUnit(opt.value);
                          hapticLight();
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={[s.unitChipText, newItemUnit === opt.value && s.unitChipTextActive]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={s.modalActions}>
                <TouchableOpacity
                  style={s.modalCancelBtn}
                  onPress={() => setShowAddItemModal(false)}
                  onPressIn={hapticLight}
                  activeOpacity={0.7}
                >
                  <Text style={s.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <ThemedButton
                  variant="primary-filled"
                  label="Añadir"
                  onPress={handleAddToInventory}
                  disabled={!newItemName.trim()}
                  fullWidth={false}
                  style={s.modalAddBtn}
                />
              </View>
            </ThemedCard>
          </View>
        </View>
      </Modal>
      <ConfirmModal {...alertProps} />
    </SafeAreaView>
  );
}

function TypeButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
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
      style={[s.typeBtn, active && s.typeBtnActive, animatedStyle]}
      onPress={onPress}
      activeOpacity={0.95}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 100 });
        hapticLight();
      }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 200 }); }}
    >
      <MaterialCommunityIcons name={icon} size={20} color={active ? SBColors.GREEN_ACCENT : SBColors.TEXT_BLACK_SOFT} style={s.typeIcon} />
      <Text style={[s.typeLabel, active && s.typeLabelActive]}>
        {label}
      </Text>
    </AnimatedTouchable>
  );
}

function ChipButton({
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
      style={[s.prefChip, active && s.prefChipSelected, animatedStyle]}
      onPress={onPress}
      activeOpacity={0.95}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 100 });
        hapticLight();
      }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 200 }); }}
    >
      <Text style={[s.prefChipText, active && s.prefChipTextSelected]}>
        {label}
      </Text>
    </AnimatedTouchable>
  );
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
  scroll: { paddingBottom: 40 },
  usageBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: SBColors.WHITE,
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14,
    marginBottom: SBSpacing.space4,
    borderWidth: 1, borderColor: SBColors.CERAMIC,
    gap: 8,
  },
  usageText: {
    fontSize: 13,
    fontFamily: SBFonts.medium,
    color: SBColors.TEXT_BLACK_SOFT,
    letterSpacing: SBType.letterSpacingNormal,
  },
  usageTextLimit: {
    color: SBColors.RED,
    fontFamily: SBFonts.semibold,
  },
  formCard: {
    marginBottom: SBSpacing.space4,
  },
  field: { marginBottom: SBSpacing.space4 },
  label: {
    fontSize: 13,
    fontFamily: SBFonts.semibold,
    color: SBColors.TEXT_BLACK,
    marginBottom: 8,
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
  typeSelector: { flexDirection: 'row', gap: 8 },
  typeBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    backgroundColor: SBColors.NEUTRAL_WARM,
    borderRadius: 12,
    borderWidth: 1, borderColor: SBColors.CERAMIC,
  },
  typeBtnActive: { backgroundColor: SBColors.GREEN_LIGHT, borderColor: SBColors.GREEN_ACCENT },
  typeIcon: { marginBottom: 4 },
  typeLabel: {
    fontSize: 11, color: SBColors.TEXT_BLACK_SOFT, fontFamily: SBFonts.medium,
    letterSpacing: SBType.letterSpacingNormal,
  },
  typeLabelActive: { color: SBColors.GREEN_ACCENT, fontFamily: SBFonts.semibold },
  sectionCard: {
    marginBottom: SBSpacing.space5,
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: SBFonts.semibold,
    color: SBColors.TEXT_BLACK,
    letterSpacing: SBType.letterSpacingNormal,
  },
  sectionCount: {
    fontSize: 12,
    fontFamily: SBFonts.regular,
    color: SBColors.TEXT_BLACK_SOFT,
    letterSpacing: SBType.letterSpacingNormal,
  },
  preferencesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  prefChip: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: SBColors.NEUTRAL_WARM,
    borderWidth: 1, borderColor: SBColors.CERAMIC,
  },
  prefChipSelected: { backgroundColor: SBColors.GREEN_LIGHT, borderColor: SBColors.GREEN_ACCENT },
  prefChipText: {
    fontSize: 13, color: SBColors.TEXT_BLACK,
    fontFamily: SBFonts.regular,
    letterSpacing: SBType.letterSpacingNormal,
  },
  prefChipTextSelected: { color: SBColors.GREEN_ACCENT, fontFamily: SBFonts.medium },
  sectionHeaderLeft: {
    flexDirection: 'column',
  },
  addItemBtn: {
    padding: 4,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ingredientsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContentContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SBSpacing.space5,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: SBFonts.semibold,
    color: SBColors.STARBUCKS_GREEN,
    letterSpacing: SBType.letterSpacingNormal,
  },
  modalField: {
    marginBottom: SBSpacing.space4,
  },
  modalLabel: {
    fontSize: 13,
    fontFamily: SBFonts.semibold,
    color: SBColors.TEXT_BLACK,
    marginBottom: 6,
    letterSpacing: SBType.letterSpacingNormal,
  },
  modalInput: {
    backgroundColor: SBColors.NEUTRAL_WARM,
    borderRadius: 12,
    paddingHorizontal: SBSpacing.space3,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: SBFonts.regular,
    color: SBColors.TEXT_BLACK,
    borderWidth: 1,
    borderColor: SBColors.CERAMIC,
    letterSpacing: SBType.letterSpacingNormal,
  },
  modalRowFields: {
    flexDirection: 'row',
  },
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
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 50,
    backgroundColor: SBColors.NEUTRAL_WARM,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SBColors.CERAMIC,
  },
  modalCancelText: {
    fontSize: 15,
    color: SBColors.TEXT_BLACK,
    fontFamily: SBFonts.medium,
    letterSpacing: SBType.letterSpacingNormal,
  },
  modalAddBtn: {
    flex: 1,
  },
});