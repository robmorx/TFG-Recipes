import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, SafeAreaView, StatusBar, ScrollView,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useRecipeVM } from '../../presentation/viewmodel/RecipeVM';
import { Recipe, RecipeType } from '../../domain/entities/recipe';
import { SBColors, SBSpacing, SBRadius, SBType, SBFonts, hapticLight } from '../../presentation/theme';
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

const RECIPE_ICONS: (keyof typeof MaterialCommunityIcons.glyphMap)[] = [
  'egg-fried', 'food-variant', 'noodle', 'pot-steam', 'soup', 'sandwich'
];

const shadowFrap = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.14,
  shadowRadius: 12,
  elevation: 10,
} as const;

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
    router.push(`/vistas/RecetaDetalleScreen?id=${recipe.recipe_uuid}`);
  };

  const backScale = useSharedValue(1);
  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backScale.value }],
  }));

  const fabScale = useSharedValue(1);
  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={SBColors.NEUTRAL_WARM} />
      <View style={s.container}>

         <View style={s.navbar}>
           <AnimatedTouchable
             onPress={() => router.back()}
             style={[s.backBtn, backAnimatedStyle]}
             activeOpacity={0.95}
             onPressIn={() => {
               backScale.value = withTiming(0.95, { duration: 100 });
               hapticLight();
             }}
             onPressOut={() => { backScale.value = withTiming(1, { duration: 200 }); }}
           >
             <MaterialCommunityIcons name="chevron-left" size={28} color={SBColors.TEXT_BLACK} />
           </AnimatedTouchable>
           <Text style={s.navTitle}>Mis Recetas</Text>
           <View style={{ width: 36 }} />
         </View>

        <View style={s.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
            <FilterButton
              label="Todas"
              active={filterType === 'ALL'}
              onPress={() => setFilterType('ALL')}
            />
            {RECIPE_TYPE_OPTIONS.map(opt => (
              <FilterButton
                key={opt.value}
                label={opt.label}
                icon={opt.icon}
                active={filterType === opt.value}
                onPress={() => setFilterType(opt.value)}
              />
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
            keyExtractor={item => item.recipe_uuid}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
              const typeLabel = getTypeLabel(item.type);
              return (
                <RecipeRow
                  item={item}
                  index={index}
                  typeLabel={typeLabel}
                  onPress={() => handleSelect(item)}
                  onDelete={() => handleDelete(item.recipe_uuid)}
                />
              );
            }}
          />
         ) : (
           <View style={s.empty}>
             <MaterialCommunityIcons name="book-open-variant" size={56} color={SBColors.STARBUCKS_GREEN} style={s.emptyIcon} />
             <Text style={s.emptyText}>Sin recetas</Text>
             <Text style={s.emptySub}>Toca + en inicio para crear una</Text>
           </View>
         )}

      </View>

      <View style={s.fabWrapper}>
        <AnimatedTouchable
          style={[s.fab, fabAnimatedStyle, shadowFrap]}
          onPress={() => router.push('/vistas/CrearRecetaScreen')}
          activeOpacity={0.95}
          onPressIn={() => {
            fabScale.value = withTiming(0.95, { duration: 100 });
            hapticLight();
          }}
          onPressOut={() => { fabScale.value = withTiming(1, { duration: 200 }); }}
        >
          <MaterialCommunityIcons name="plus" size={32} color={SBColors.WHITE} />
        </AnimatedTouchable>
        <Text style={s.fabLabel}>Nueva Receta</Text>
      </View>
    </SafeAreaView>
  );
}

function FilterButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
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
      {icon && <MaterialCommunityIcons name={icon} size={18} color={active ? SBColors.WHITE : SBColors.TEXT_BLACK_SOFT} />}
      <Text style={[s.filterBtnText, active && s.filterBtnTextActive]}>{label}</Text>
    </AnimatedTouchable>
  );
}

function RecipeRow({
  item,
  index,
  typeLabel,
  onPress,
  onDelete,
}: {
  item: Recipe;
  index: number;
  typeLabel: string;
  onPress: () => void;
  onDelete: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconIndex = index % RECIPE_ICONS.length;

  return (
    <AnimatedTouchable
      style={[s.row, animatedStyle]}
      onPress={onPress}
      activeOpacity={0.95}
      onPressIn={() => {
        scale.value = withTiming(0.98, { duration: 100 });
        hapticLight();
      }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 200 }); }}
    >
      <View style={s.iconBox}>
        <MaterialCommunityIcons name={RECIPE_ICONS[iconIndex]} size={26} color={SBColors.GREEN_ACCENT} />
      </View>
      <View style={s.recipeInfo}>
        <Text style={s.name} numberOfLines={1}>{item.name || 'Sin nombre'}</Text>
        {typeLabel ? (
          <View style={s.typeTag}>
            <Text style={s.typeTagText}>{typeLabel}</Text>
          </View>
        ) : null}
      </View>
      <TouchableOpacity
        style={s.deleteBtn}
        onPress={onDelete}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPressIn={hapticLight}
      >
        <MaterialCommunityIcons name="close" size={18} color={SBColors.RED} />
      </TouchableOpacity>
    </AnimatedTouchable>
  );
}

function getTypeLabel(type?: RecipeType): string {
  if (!type) return '';
  const opt = RECIPE_TYPE_OPTIONS.find(o => o.value === type);
  return opt ? opt.label : '';
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
  filterSection: { marginBottom: SBSpacing.space3 },
  filterScroll: { gap: 8 },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50,
    backgroundColor: SBColors.WHITE, borderWidth: 1, borderColor: SBColors.CERAMIC,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 0.5,
    elevation: 1,
  },
  filterBtnActive: { backgroundColor: SBColors.GREEN_ACCENT, borderColor: SBColors.GREEN_ACCENT },
  filterIcon: { fontSize: 14 },
  filterBtnText: {
    fontSize: 13, color: SBColors.TEXT_BLACK_SOFT, fontFamily: SBFonts.medium,
    letterSpacing: SBType.letterSpacingNormal,
  },
  filterBtnTextActive: { color: SBColors.WHITE },
  statsRow: { marginBottom: SBSpacing.space3 },
  statsText: {
    fontSize: 13, color: SBColors.TEXT_BLACK_SOFT,
    fontFamily: SBFonts.regular,
    letterSpacing: SBType.letterSpacingNormal,
  },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: {
    fontSize: 14, color: SBColors.TEXT_BLACK_SOFT,
    fontFamily: SBFonts.regular,
    letterSpacing: SBType.letterSpacingNormal,
  },
  list: { gap: 10, paddingBottom: 24 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: SBColors.WHITE, borderRadius: SBRadius.card,
    paddingVertical: 14, paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.24,
    shadowRadius: 1,
    elevation: 2,
  },
  iconBox: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: SBColors.GREEN_LIGHT,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  recipeInfo: { flex: 1 },
  name: {
    fontSize: 15, fontFamily: SBFonts.semibold, color: SBColors.TEXT_BLACK,
    letterSpacing: SBType.letterSpacingNormal,
  },
  typeTag: {
    alignSelf: 'flex-start',
    backgroundColor: SBColors.NEUTRAL_WARM,
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 8, marginTop: 4,
  },
  typeTagText: {
    fontSize: 11, color: SBColors.TEXT_BLACK_SOFT,
    fontFamily: SBFonts.regular,
    letterSpacing: SBType.letterSpacingNormal,
  },
  deleteBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: SBColors.NEUTRAL_WARM, alignItems: 'center', justifyContent: 'center',
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyIcon: { marginBottom: 14 },
  emptyText: {
    fontSize: 17, fontFamily: SBFonts.semibold, color: SBColors.TEXT_BLACK, marginBottom: 6,
    letterSpacing: SBType.letterSpacingNormal,
  },
  emptySub: {
    fontSize: 13, color: SBColors.TEXT_BLACK_SOFT, textAlign: 'center',
    fontFamily: SBFonts.regular,
    letterSpacing: SBType.letterSpacingNormal,
  },
  fabWrapper: {
    position: 'absolute',
    bottom: SBSpacing.space7,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 8,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: SBColors.GREEN_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabLabel: {
    fontSize: 12,
    color: SBColors.TEXT_BLACK_SOFT,
    fontFamily: SBFonts.medium,
    letterSpacing: SBType.letterSpacingNormal,
  },
});
