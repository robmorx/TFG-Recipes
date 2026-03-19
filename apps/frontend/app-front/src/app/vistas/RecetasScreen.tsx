import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
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
  danger: '#D94F4F',
  selected: '#EAF1FA',
  selectedBorder: '#3A6EA5',
};

type Recipe = {
  id: string;
  name: string;
  emoji?: string;
};

type Props = {
  onBack?: () => void;
  onSelectRecipe?: (recipe: Recipe) => void;
  initialRecipes?: Recipe[];
};

const MOCK_RECIPES: Recipe[] = [
  { id: '1', name: 'Pollo al limón', emoji: '🍋' },
  { id: '2', name: 'Ensalada mediterránea', emoji: '🥗' },
  { id: '3', name: 'Pasta con verduras', emoji: '🍝' },
];

export default function RecetasScreen({ onBack, onSelectRecipe, initialRecipes = MOCK_RECIPES }: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleSelect = (recipe: Recipe) => {
    setSelectedId(recipe.id);
    onSelectRecipe?.(recipe);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>

        {/* Navbar */}
        <View style={styles.navbar}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>Recetas Listado</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {recipes.length} {recipes.length === 1 ? 'receta guardada' : 'recetas guardadas'}
        </Text>

        {recipes.length > 0 ? (
          <FlatList
            data={recipes}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = selectedId === item.id;
              return (
                <TouchableOpacity
                  style={[styles.recipeRow, isSelected && styles.recipeRowSelected]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>

                  <View style={styles.recipeImagePlaceholder}>
                    <Text style={styles.recipeEmoji}>{item.emoji ?? '🍴'}</Text>
                  </View>

                  <Text style={styles.recipeName}>{item.name}</Text>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item.id)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.deleteIcon}>✕</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            }}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>Sin recetas guardadas.</Text>
            <Text style={styles.emptySubtext}>Genera una receta con IA desde el inicio.</Text>
          </View>
        )}

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
    paddingBottom: 12,
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
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16,
    fontWeight: '500',
  },
  listContent: {
    gap: 10,
    paddingBottom: 32,
  },
  recipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  recipeRowSelected: {
    backgroundColor: COLORS.selected,
    borderColor: COLORS.selectedBorder,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
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
    fontSize: 12,
    fontWeight: '800',
  },
  recipeImagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  recipeEmoji: {
    fontSize: 24,
  },
  recipeName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    fontSize: 10,
    color: COLORS.danger,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 14,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
