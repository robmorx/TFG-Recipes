import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, SafeAreaView, StatusBar, ScrollView,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useRecipeVM } from '../../presentation/viewmodel/RecipeVM';
import { Recipe, RecipeType } from '../../domain/entities/recipe';

const C = {
  bg: '#F5F2EB',
  card: '#FFFFFF',
  cardAlt: '#F0EDE5',
  primary: '#6B8E6B',
  secondary: '#A4C3A2',
  text: '#3D3D3D',
  muted: '#8B8B8B',
  border: '#E0DCD4',
  danger: '#C97070',
  accent: '#D4A574',
};

const RECIPE_TYPE_OPTIONS = [
  { value: RecipeType.BREAKFAST, label: 'Desayuno', icon: '🌅' },
  { value: RecipeType.LUNCH, label: 'Comida', icon: '☀️' },
  { value: RecipeType.DINNER, label: 'Cena', icon: '🌙' },
];

const RECIPE_ICONS = ['🍳', '🥗', '🍝', '🥘', '🍲', '🥙'];

export default function RecetasScreen() {
  const router = useRouter();
  const { recipes, loadRecipes, deleteRecipe, isLoading } = useRecipeVM();
  const [filterType, setFilterType] = useState<RecipeType | 'ALL'>('ALL');

  useEffect(() => {
    loadRecipes();
  }, []);

  const filteredRecipes = filterType === 'ALL' 
    ? recipes 
    : recipes.filter(r => r.type === filterType);

  const handleDelete = (id: string) => {
    deleteRecipe(id);
  };

  const handleSelect = (recipe: Recipe) => {
    router.push(`/vistas/RecetaDetalleScreen?id=${recipe.id}`);
  };

  const getRecipeIcon = (index: number) => RECIPE_ICONS[index % RECIPE_ICONS.length];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <View style={s.container}>

        <View style={s.navbar}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
            <Text style={s.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={s.navTitle}>Mis Recetas</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={s.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
            <TouchableOpacity
              style={[s.filterBtn, filterType === 'ALL' && s.filterBtnActive]}
              onPress={() => setFilterType('ALL')}
            >
              <Text style={[s.filterBtnText, filterType === 'ALL' && s.filterBtnTextActive]}>Todas</Text>
            </TouchableOpacity>
            {RECIPE_TYPE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[s.filterBtn, filterType === opt.value && s.filterBtnActive]}
                onPress={() => setFilterType(opt.value)}
              >
                <Text style={s.filterIcon}>{opt.icon}</Text>
                <Text style={[s.filterBtnText, filterType === opt.value && s.filterBtnTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={s.statsRow}>
          <Text style={s.statsText}>
            {filteredRecipes.length} {filteredRecipes.length === 1 ? 'receta' : 'recetas'}
          </Text>
        </View>

        {isLoading ? (
          <View style={s.loading}>
            <Text style={s.loadingText}>Cargando recetas...</Text>
          </View>
        ) : filteredRecipes.length > 0 ? (
          <FlatList
            data={filteredRecipes}
            keyExtractor={item => item.id}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
              const typeLabel = getTypeLabel(item.type);
              return (
                <TouchableOpacity
                  style={s.row}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={[s.iconBox, { backgroundColor: C.secondary }]}>
                    <Text style={s.recipeIcon}>{getRecipeIcon(index)}</Text>
                  </View>
                  <View style={s.recipeInfo}>
                    <Text style={s.name} numberOfLines={1}>{item.name || 'Sin nombre'}</Text>
                    {item.type && (
                      <View style={s.typeTag}>
                        <Text style={s.typeTagText}>{typeLabel}</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    style={s.deleteBtn}
                    onPress={() => handleDelete(item.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={s.deleteIcon}>✕</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            }}
          />
        ) : (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📖</Text>
            <Text style={s.emptyText}>Sin recetas</Text>
            <Text style={s.emptySub}>Toca + en inicio para crear una</Text>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
}

function getTypeLabel(type?: RecipeType): string {
  if (!type) return '';
  const opt = RECIPE_TYPE_OPTIONS.find(o => o.value === type);
  return opt ? opt.label : '';
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
  filterSection: { marginBottom: 12 },
  filterScroll: { gap: 8 },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    gap: 4,
  },
  filterBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterIcon: { fontSize: 14 },
  filterBtnText: { fontSize: 13, color: C.muted, fontWeight: '500' },
  filterBtnTextActive: { color: '#fff' },
  statsRow: { marginBottom: 12 },
  statsText: { fontSize: 13, color: C.muted },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 14, color: C.muted },
  list: { gap: 10, paddingBottom: 24 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 14,
    borderWidth: 1, borderColor: C.border,
  },
  iconBox: {
    width: 48, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  recipeIcon: { fontSize: 24 },
  recipeInfo: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: C.text },
  typeTag: {
    alignSelf: 'flex-start',
    backgroundColor: C.cardAlt,
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 8, marginTop: 4,
  },
  typeTagText: { fontSize: 11, color: C.muted },
  deleteBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.cardAlt, alignItems: 'center', justifyContent: 'center',
  },
  deleteIcon: { fontSize: 10, color: C.danger, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 14 },
  emptyText: { fontSize: 17, fontWeight: '600', color: C.text, marginBottom: 6 },
  emptySub: { fontSize: 13, color: C.muted, textAlign: 'center' },
});
