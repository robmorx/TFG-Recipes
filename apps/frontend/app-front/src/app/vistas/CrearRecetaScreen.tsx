import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useRecipeVM } from '../../presentation/viewmodel/RecipeVM';
import { RecipeCreateRequestDTO } from '../../domain/dto/recipe.create.request.dto';
import { RecipeType } from '../../domain/entities/recipe';

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
  selected: '#E8F0E8',
  selectedBorder: '#6B8E6B',
  accent: '#D4A574',
};

const RECIPE_TYPE_OPTIONS = [
  { value: RecipeType.BREAKFAST, label: 'Desayuno', icon: '🌅' },
  { value: RecipeType.LUNCH, label: 'Comida', icon: '☀️' },
  { value: RecipeType.DINNER, label: 'Cena', icon: '🌙' },
];

type IngredientOption = { id: string; name: string; selected: boolean; isCustom?: boolean };

const DEFAULT_INGREDIENTS = [
  'Pechuga de pollo', 'Patatas', 'Cebolla', 'Ajo', 'Tomate', 'Aceite de oliva',
  'Arroz', 'Pasta', 'Huevos', 'Leche', 'Queso', 'Jamón',
];

export default function CrearRecetaScreen() {
  const router = useRouter();
  const { addRecipe, isLoading } = useRecipeVM();
  const [recipeName, setRecipeName] = useState('');
  const [recipeType, setRecipeType] = useState<RecipeType>(RecipeType.DINNER);
  const [quantity, setQuantity] = useState('4');
  const [newIngredient, setNewIngredient] = useState('');
  const [ingredients, setIngredients] = useState<IngredientOption[]>(
    DEFAULT_INGREDIENTS.map((name, i) => ({ id: i.toString(), name, selected: false }))
  );

  const toggle = (id: string) =>
    setIngredients(prev => prev.map(it => it.id === id ? { ...it, selected: !it.selected } : it));

  const remove = (id: string) =>
    setIngredients(prev => prev.filter(it => it.id !== id));

  const addCustomIngredient = () => {
    const trimmed = newIngredient.trim();
    if (!trimmed) return;
    const newId = Date.now().toString();
    setIngredients(prev => [...prev, { id: newId, name: trimmed, selected: true, isCustom: true }]);
    setNewIngredient('');
  };

  const handleSave = async () => {
    if (!recipeName.trim()) return;
    
    const prompt = `Crear una receta de ${recipeName} para ${quantity} personas`;
    
    const request: RecipeCreateRequestDTO = {
      prompt,
      type: recipeType,
      user_uuid: 'user-001',
    };
    await addRecipe(request);
    router.back();
  };

  const selectedCount = 0;
  const canSave = recipeName.trim().length > 0;

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
            <Text style={s.navTitle}>Nueva Receta</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

            <View style={s.formCard}>
              <View style={s.field}>
                <Text style={s.label}>Nombre</Text>
                <TextInput
                  style={s.input}
                  placeholder="Ej: Pollo asado"
                  placeholderTextColor={C.muted}
                  value={recipeName}
                  onChangeText={setRecipeName}
                />
              </View>

              <View style={s.field}>
                <Text style={s.label}>Tipo</Text>
                <View style={s.typeSelector}>
                  {RECIPE_TYPE_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[s.typeBtn, recipeType === opt.value && s.typeBtnActive]}
                      onPress={() => setRecipeType(opt.value)}
                    >
                      <Text style={s.typeIcon}>{opt.icon}</Text>
                      <Text style={[s.typeLabel, recipeType === opt.value && s.typeLabelActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={s.field}>
                <Text style={s.label}>Personas</Text>
                <TextInput
                  style={s.input}
                  placeholder="4"
                  placeholderTextColor={C.muted}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={s.sectionCard}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Ingredientes</Text>
                <Text style={s.sectionCount}>{selectedCount} seleccionados</Text>
              </View>

              <View style={s.addIngredientRow}>
                <TextInput
                  style={s.addIngredientInput}
                  placeholder="Añadir ingrediente..."
                  placeholderTextColor={C.muted}
                  value={newIngredient}
                  onChangeText={setNewIngredient}
                  onSubmitEditing={addCustomIngredient}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[s.addIngredientBtn, !newIngredient.trim() && s.addIngredientBtnDisabled]}
                  onPress={addCustomIngredient}
                  disabled={!newIngredient.trim()}
                >
                  <Text style={s.addIngredientBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={s.ingredientsGrid}>
                {ingredients.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[s.ingredientChip, item.selected && s.ingredientChipSelected]}
                    onPress={() => toggle(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.ingredientChipText, item.selected && s.ingredientChipTextSelected]}>
                      {item.name}
                    </Text>
                    {item.isCustom && (
                      <TouchableOpacity
                        style={s.chipRemove}
                        onPress={() => remove(item.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={s.chipRemoveText}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[s.saveBtn, !canSave && s.saveBtnDisabled]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={!canSave || isLoading}
            >
              <Text style={s.saveBtnText}>{isLoading ? 'Guardando...' : 'Guardar Receta'}</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
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
  scroll: { paddingBottom: 40 },
  formCard: {
    backgroundColor: C.card, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 16,
  },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 8 },
  input: {
    backgroundColor: C.inputBg, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: C.text, borderWidth: 1, borderColor: C.border,
  },
  typeSelector: { flexDirection: 'row', gap: 8 },
  typeBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    backgroundColor: C.inputBg, borderRadius: 10,
    borderWidth: 1, borderColor: C.border,
  },
  typeBtnActive: { backgroundColor: C.selected, borderColor: C.selectedBorder },
  typeIcon: { fontSize: 18, marginBottom: 4 },
  typeLabel: { fontSize: 11, color: C.muted, fontWeight: '500' },
  typeLabelActive: { color: C.primary, fontWeight: '600' },
  sectionCard: {
    backgroundColor: C.card, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: C.text },
  sectionCount: { fontSize: 12, color: C.muted },
  addIngredientRow: { flexDirection: 'row', marginBottom: 14, gap: 8 },
  addIngredientInput: {
    flex: 1, backgroundColor: C.inputBg, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    color: C.text, borderWidth: 1, borderColor: C.border,
  },
  addIngredientBtn: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center',
  },
  addIngredientBtnDisabled: { backgroundColor: C.cardAlt },
  addIngredientBtnText: { fontSize: 22, color: '#fff', fontWeight: '600' },
  ingredientsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ingredientChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    backgroundColor: C.cardAlt, borderWidth: 1, borderColor: C.border,
  },
  ingredientChipSelected: { backgroundColor: C.selected, borderColor: C.selectedBorder },
  ingredientChipText: { fontSize: 13, color: C.text },
  ingredientChipTextSelected: { color: C.primary, fontWeight: '500' },
  chipRemove: { marginLeft: 6 },
  chipRemoveText: { fontSize: 10, color: C.danger, fontWeight: '600' },
  saveBtn: {
    backgroundColor: C.primary, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: C.cardAlt },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
