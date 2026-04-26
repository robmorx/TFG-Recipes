import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  SafeAreaView, StatusBar,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Recipe, RecipeType } from '../../domain/entities/recipe';
import { container } from '../../core/container';
import { IRecipeUseCase } from '../../domain/interfaces/IRecipeUseCase';
import { TYPES } from '../../core/TYPES';

const C = {
  bg: '#F5F2EB',
  card: '#FFFFFF',
  cardAlt: '#F0EDE5',
  primary: '#6B8E6B',
  secondary: '#A4C3A2',
  text: '#3D3D3D',
  muted: '#8B8B8B',
  border: '#E0DCD4',
  accent: '#D4A574',
};

const RECIPE_TYPE_OPTIONS = [
  { value: RecipeType.BREAKFAST, label: 'Desayuno', icon: '🌅' },
  { value: RecipeType.LUNCH, label: 'Comida', icon: '☀️' },
  { value: RecipeType.DINNER, label: 'Cena', icon: '🌙' },
];

const RECIPE_ICONS = ['🍳', '🥗', '🍝', '🥘', '🍲', '🥙'];

type SectionProps = { title: string; children: React.ReactNode; defaultOpen?: boolean };

function Section({ title, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={sectionStyles.container}>
      <TouchableOpacity style={sectionStyles.header} onPress={() => setOpen(!open)} activeOpacity={0.7}>
        <Text style={sectionStyles.title}>{title}</Text>
        <Text style={sectionStyles.chevron}>{open ? '−' : '+'}</Text>
      </TouchableOpacity>
      {open && <View style={sectionStyles.body}>{children}</View>}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: {
    backgroundColor: C.card, borderRadius: 14,
    borderWidth: 1, borderColor: C.border, marginBottom: 14, overflow: 'hidden',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 16,
  },
  title: { fontSize: 15, fontWeight: '600', color: C.text },
  chevron: { fontSize: 16, color: C.muted, fontWeight: '600' },
  body: { paddingHorizontal: 16, paddingBottom: 14 },
});

export default function RecetaDetalleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecipe = async () => {
      if (id) {
        setLoading(true);
        const recipeUseCase = container.get<IRecipeUseCase>(TYPES.IRecipeUseCase);
        const found = await recipeUseCase.getById(id);
        setRecipe(found ?? undefined);
        setLoading(false);
      }
    };
    loadRecipe();
  }, [id]);

  const getTypeInfo = (type?: RecipeType) => RECIPE_TYPE_OPTIONS.find(o => o.value === type);

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <View style={s.container}>
          <View style={s.navbar}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
              <Text style={s.backIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={s.navTitle}>Cargando...</Text>
            <View style={{ width: 36 }} />
          </View>
          <View style={s.loading}>
            <Text style={s.loadingText}>Cargando receta</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <View style={s.container}>
          <View style={s.navbar}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
              <Text style={s.backIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={s.navTitle}>Detalle</Text>
            <View style={{ width: 36 }} />
          </View>
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🔍</Text>
            <Text style={s.emptyText}>Receta no encontrada</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const typeInfo = getTypeInfo(recipe.type);
  const iconIndex = parseInt(id?.slice(-1) || '0', 10) % RECIPE_ICONS.length;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <View style={s.container}>

        <View style={s.navbar}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
            <Text style={s.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={s.navTitle} numberOfLines={1}>{recipe.name || 'Receta'}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          <View style={s.headerCard}>
            <View style={[s.iconBox, { backgroundColor: C.secondary }]}>
              <Text style={s.recipeIcon}>{RECIPE_ICONS[iconIndex]}</Text>
            </View>
            <View style={s.headerInfo}>
              <Text style={s.recipeName}>{recipe.name || 'Sin nombre'}</Text>
              {typeInfo && (
                <View style={s.typeTag}>
                  <Text style={s.typeTagText}>{typeInfo.icon} {typeInfo.label}</Text>
                </View>
              )}
            </View>
          </View>

          <Section title="Ingredientes" defaultOpen>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              recipe.ingredients.map((ing: string, i: number) => (
                <View key={i} style={s.ingredientRow}>
                  <View style={s.ingredientDot} />
                  <Text style={s.ingredientText}>{ing}</Text>
                </View>
              ))
            ) : (
              <Text style={s.emptySection}>Sin ingredientes</Text>
            )}
          </Section>

          <Section title="Preparación" defaultOpen>
            {recipe.steps && recipe.steps.length > 0 ? (
              recipe.steps.map((step: string, i: number) => (
                <View key={i} style={s.stepRow}>
                  <View style={s.stepNumber}>
                    <Text style={s.stepNumberText}>{i + 1}</Text>
                  </View>
                  <Text style={s.stepText}>{step}</Text>
                </View>
              ))
            ) : (
              <Text style={s.emptySection}>Sin pasos definidos</Text>
            )}
          </Section>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, paddingHorizontal: 20 },
  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 12, paddingBottom: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 22, color: C.text, lineHeight: 26 },
  navTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: C.text, textAlign: 'center', marginHorizontal: 8 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 14, color: C.muted },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: C.muted },
  scroll: { paddingBottom: 32 },
  headerCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: C.border,
    marginBottom: 16,
  },
  iconBox: {
    width: 64, height: 64, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  recipeIcon: { fontSize: 32 },
  headerInfo: { flex: 1 },
  recipeName: { fontSize: 18, fontWeight: '600', color: C.text, marginBottom: 6 },
  typeTag: {
    backgroundColor: C.cardAlt, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, alignSelf: 'flex-start',
  },
  typeTagText: { fontSize: 12, color: C.muted },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  ingredientDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: C.primary, marginRight: 12,
  },
  ingredientText: { fontSize: 14, color: C.text, flex: 1 },
  stepRow: { flexDirection: 'row', marginBottom: 14 },
  stepNumber: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
    marginRight: 12, marginTop: 2,
  },
  stepNumberText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  stepText: { flex: 1, fontSize: 14, color: C.text, lineHeight: 20 },
  emptySection: { fontSize: 14, color: C.muted, fontStyle: 'italic' },
});