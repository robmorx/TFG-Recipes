import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';

const COLORS = {
  background: '#F5F0E8',
  card: '#FDFAF4',
  cardAlt: '#EDE8DF',
  primary: '#3A6EA5',
  text: '#1C1C1E',
  textMuted: '#8A8A8E',
  border: '#E0D9CC',
  inputBg: '#EFECE4',
  danger: '#D94F4F',
  selected: '#EAF1FA',
  selectedBorder: '#3A6EA5',
};

type IngredientOption = {
  id: string;
  name: string;
  selected: boolean;
};

type Props = {
  onBack?: () => void;
  onSave?: (name: string, ingredients: string[]) => void;
  availableIngredients?: string[];
  isLoading?: boolean;
};

const DEFAULT_INGREDIENTS = [
  'Pechuga de Pollo',
  'Patatas',
  'Cebolla',
  'Ajo',
  'Tomate',
  'Aceite de oliva',
];

export default function GenerarRecetaScreen({
  onBack,
  onSave,
  availableIngredients = DEFAULT_INGREDIENTS,
  isLoading = false,
}: Props) {
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState<IngredientOption[]>(
    availableIngredients.map((name, i) => ({ id: i.toString(), name, selected: i === 0 }))
  );

  const toggleIngredient = (id: string) => {
    setIngredients(prev =>
      prev.map(item => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const removeIngredient = (id: string) => {
    setIngredients(prev => prev.filter(item => item.id !== id));
  };

  const handleSave = () => {
    const selected = ingredients.filter(i => i.selected).map(i => i.name);
    onSave?.(recipeName, selected);
  };

  const selectedCount = ingredients.filter(i => i.selected).length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>

        {/* Navbar */}
        <View style={styles.navbar}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>Crear Receta</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* AI Badge */}
          <View style={styles.aiBadge}>
            <Text style={styles.aiEmoji}>✨</Text>
            <Text style={styles.aiText}>Generada con Inteligencia Artificial</Text>
          </View>

          {/* Name field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nombre de Receta</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Pollo asado con hierbas"
              placeholderTextColor={COLORS.textMuted}
              value={recipeName}
              onChangeText={setRecipeName}
            />
          </View>

          {/* Ingredients */}
          <View style={styles.fieldGroup}>
            <View style={styles.fieldHeader}>
              <Text style={styles.label}>Alimentos incluidos</Text>
              <Text style={styles.fieldCount}>{selectedCount} seleccionados</Text>
            </View>

            <View style={styles.ingredientList}>
              {ingredients.map(item => (
                <View
                  key={item.id}
                  style={[
                    styles.ingredientRow,
                    item.selected && styles.ingredientRowSelected,
                  ]}
                >
                  <TouchableOpacity
                    style={[styles.checkbox, item.selected && styles.checkboxSelected]}
                    onPress={() => toggleIngredient(item.id)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                  >
                    {item.selected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>

                  <Text style={[styles.ingredientName, item.selected && styles.ingredientNameSelected]}>
                    {item.name}
                  </Text>

                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeIngredient(item.id)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={styles.removeIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {ingredients.length === 0 && (
              <Text style={styles.noIngredients}>
                Sin alimentos. Añade ingredientes desde Inventario.
              </Text>
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, (isLoading || !recipeName.trim()) && styles.saveBtnDisabled]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={isLoading || !recipeName.trim()}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>✦ Guardar Receta</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: COLORS.text,
    lineHeight: 26,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  scroll: {
    paddingBottom: 40,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF1FA',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#C5D9F0',
  },
  aiEmoji: {
    fontSize: 14,
    marginRight: 8,
  },
  aiText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  fieldGroup: {
    marginBottom: 22,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  fieldCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ingredientList: {
    gap: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  ingredientRowSelected: {
    backgroundColor: '#EAF1FA',
    borderColor: COLORS.selectedBorder,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  ingredientName: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  ingredientNameSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  removeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    fontSize: 9,
    color: COLORS.danger,
    fontWeight: '700',
  },
  noIngredients: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    padding: 20,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 7,
  },
  saveBtnDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
