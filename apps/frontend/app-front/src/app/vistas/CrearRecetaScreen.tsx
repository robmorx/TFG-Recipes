import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useRecipeVM } from '../../presentation/viewmodel/RecipeVM';
import { RecipeCreateRequestDTO } from '../../domain/dto/recipe.create.request.dto';
import { RecipeType } from '../../domain/entities/recipe';
import { useInventoryVM } from '../../presentation/viewmodel/InventoryVM';
import { useAuth } from '../../presentation/context/AuthContext';

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

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetariano' },
  { id: 'vegan', label: 'Vegano' },
  { id: 'gluten-free', label: 'Sin gluten' },
  { id: 'dairy-free', label: 'Sin lácteos' },
  { id: 'nut-free', label: 'Sin frutos secos' },
  { id: 'low-carb', label: 'Bajo en carbohidratos' },
];

type IngredientOption = { id: string; name: string; selected: boolean; quantity?: number; quantityUnit?: string };



export default function CrearRecetaScreen() {
  const router = useRouter();
  const { addRecipe, isLoading } = useRecipeVM();
  const { inventory } = useInventoryVM();
  const { user } = useAuth();
  const [recipeType, setRecipeType] = useState<RecipeType>(RecipeType.DINNER);
  const [quantity, setQuantity] = useState('4');
  const [ingredients, setIngredients] = useState<IngredientOption[]>([]);
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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
      await addRecipe(request);
      router.back();
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedCount = ingredients.filter(i => i.selected).length;
  const canSave = selectedCount > 0;

  const getTypeLabel = (type: RecipeType) => {
    const opt = RECIPE_TYPE_OPTIONS.find(o => o.value === type);
    return opt ? opt.label : '';
  };

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
                <Text style={s.sectionTitle}>Preferencias dietéticas</Text>
                <Text style={s.sectionCount}>{dietaryPrefs.length} seleccionadas</Text>
              </View>
              <View style={s.preferencesGrid}>
                {DIETARY_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[s.prefChip, dietaryPrefs.includes(opt.id) && s.prefChipSelected]}
                    onPress={() => toggleDietary(opt.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.prefChipText, dietaryPrefs.includes(opt.id) && s.prefChipTextSelected]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={s.sectionCard}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Ingredientes</Text>
                <Text style={s.sectionCount}>{selectedCount} seleccionados</Text>
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
                      {item.quantity && item.quantityUnit 
                        ? `${item.quantity} ${item.quantityUnit} ${item.name}`
                        : item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[s.saveBtn, (!canSave || isGenerating) && s.saveBtnDisabled]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={!canSave || isGenerating}
            >
              <Text style={s.saveBtnText}>{isGenerating ? 'Generando...' : 'Generar Receta'}</Text>
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
  preferencesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  prefChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    backgroundColor: C.cardAlt, borderWidth: 1, borderColor: C.border,
  },
  prefChipSelected: { backgroundColor: C.selected, borderColor: C.selectedBorder },
  prefChipText: { fontSize: 13, color: C.text },
  prefChipTextSelected: { color: C.primary, fontWeight: '500' },
  ingredientsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ingredientChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    backgroundColor: C.cardAlt, borderWidth: 1, borderColor: C.border,
  },
  ingredientChipSelected: { backgroundColor: C.selected, borderColor: C.selectedBorder },
  ingredientChipText: { fontSize: 13, color: C.text },
  ingredientChipTextSelected: { color: C.primary, fontWeight: '500' },
  saveBtn: {
    backgroundColor: C.primary, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: C.cardAlt },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});