import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
  SafeAreaView, StatusBar, Modal, useWindowDimensions,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Recipe, RecipeStep, RecipeType } from '../../domain/entities/recipe';
import { container } from '../../core/container';
import { IRecipeUseCase } from '../../domain/interfaces/IRecipeUseCase';
import { TYPES } from '../../core/TYPES';
import type { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

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

export default function RecetaDetalleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [recipe, setRecipe] = useState<Recipe | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [showIngredients, setShowIngredients] = useState(false);
  const [scrollHeight, setScrollHeight] = useState(screenHeight);

  const [activeTimers, setActiveTimers] = useState<{ [key: number]: number }>({});
  const timerIntervals = useRef<{ [key: number]: number }>({});
  const scrollRef = useRef<ScrollView>(null);

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

  const startTimer = (stepIndex: number, minutes: number) => {
    const totalSeconds = minutes * 60;
    setActiveTimers(prev => ({ ...prev, [stepIndex]: totalSeconds }));

    timerIntervals.current[stepIndex] = setInterval(() => {
      setActiveTimers(prev => {
        const current = prev[stepIndex] || 0;
        if (current <= 1) {
          clearInterval(timerIntervals.current[stepIndex]);
          delete timerIntervals.current[stepIndex];

          Alert.alert(
            '¡Timer terminado!',
            `El paso ${stepIndex + 1} ha terminado.`,
            [{ text: 'OK' }]
          );

          const newTimers = { ...prev };
          delete newTimers[stepIndex];
          return newTimers;
        }
        return { ...prev, [stepIndex]: current - 1 };
      });
    }, 1000);
  };

  const stopTimer = (stepIndex: number) => {
    if (timerIntervals.current[stepIndex]) {
      clearInterval(timerIntervals.current[stepIndex]);
      delete timerIntervals.current[stepIndex];
    }
    setActiveTimers(prev => {
      const newTimers = { ...prev };
      delete newTimers[stepIndex];
      return newTimers;
    });
  };

  useEffect(() => {
    return () => {
      Object.values(timerIntervals.current).forEach(clearInterval);
    };
  }, []);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const step = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    setCurrentStep(step);
  };

  const goToStep = (index: number) => {
    setCurrentStep(index);
    scrollRef.current?.scrollTo({ x: index * screenWidth, animated: true });
  };

  const getTypeInfo = (type?: RecipeType) => RECIPE_TYPE_OPTIONS.find(o => o.value === type);

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <View style={s.root}>
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
        <View style={s.root}>
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

  const steps = recipe.steps || [];
  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const typeInfo = getTypeInfo(recipe.type);
  const iconIndex = parseInt(id?.slice(-1) || '0', 10) % RECIPE_ICONS.length;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <View style={s.root}>
        <View style={s.navbar}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
            <Text style={s.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={s.navCenter}>
            <Text style={s.navTitle} numberOfLines={1}>{recipe.name || 'Receta'}</Text>
            {typeInfo && (
              <Text style={s.navType}>{typeInfo.icon} {typeInfo.label}</Text>
            )}
          </View>
          <TouchableOpacity onPress={() => setShowIngredients(true)} style={s.ingredientsBtn} activeOpacity={0.7}>
            <Text style={s.ingredientsIcon}>🧺</Text>
          </TouchableOpacity>
        </View>

        <View style={s.progressRow}>
          <Text style={s.progressText}>PASO {currentStep + 1} / {totalSteps}</Text>
          <View style={s.dotsRow}>
            {steps.map((_, i) => (
              <View key={i} style={[s.dot, i === currentStep && s.dotActive]} />
            ))}
          </View>
        </View>

        <View style={s.scrollContainer} onLayout={(e) => setScrollHeight(e.nativeEvent.layout.height)}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScrollEnd}
          >
            {steps.map((step: RecipeStep, i: number) => (
              <View key={i} style={[s.stepPage, { width: screenWidth, height: scrollHeight }]}>
                <View style={s.stepNumberCircle}>
                  <Text style={s.stepNumberCircleText}>{i + 1}</Text>
                </View>

                <View style={s.stepCard}>
                  <Text style={s.stepInstruction}>{step.instruction}</Text>
                </View>

                {step.timerMinutes > 0 && (
                  <View style={s.timerContainer}>
                    {activeTimers[i] !== undefined ? (
                      <>
                        <View style={s.timerDisplay}>
                          <Text style={s.timerText}>
                            {Math.floor(activeTimers[i] / 60)}:
                            {(activeTimers[i] % 60).toString().padStart(2, '0')}
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => stopTimer(i)} style={s.timerBtnStop}>
                          <Text style={s.timerBtnText}>⏹ Detener</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity onPress={() => startTimer(i, step.timerMinutes)} style={s.timerBtnStart}>
                        <Text style={s.timerBtnText}>⏱ Iniciar Timer ({step.timerMinutes} min)</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={s.navRow}>
          <TouchableOpacity
            style={[s.navBtn, s.navBtnPrev, isFirstStep && s.navBtnDisabled]}
            onPress={() => goToStep(currentStep - 1)}
            disabled={isFirstStep}
            activeOpacity={0.7}
          >
            <Text style={[s.navBtnText, isFirstStep && s.navBtnTextDisabled]}>← Anterior</Text>
          </TouchableOpacity>

          {isLastStep ? (
            <TouchableOpacity
              style={[s.navBtn, s.navBtnFinish]}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={s.navBtnTextFinish}>✓ Completar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[s.navBtn, s.navBtnNext]}
              onPress={() => goToStep(currentStep + 1)}
              activeOpacity={0.7}
            >
              <Text style={s.navBtnText}>Siguiente →</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal
        visible={showIngredients}
        transparent
        animationType="fade"
        onRequestClose={() => setShowIngredients(false)}
      >
        <TouchableOpacity
          style={modalStyles.overlay}
          activeOpacity={1}
          onPress={() => setShowIngredients(false)}
        >
          <View style={modalStyles.content}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Ingredientes</Text>
              <TouchableOpacity onPress={() => setShowIngredients(false)}>
                <Text style={modalStyles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              recipe.ingredients.map((ing: string, i: number) => (
                <View key={i} style={modalStyles.row}>
                  <View style={modalStyles.dot} />
                  <Text style={modalStyles.text}>{ing}</Text>
                </View>
              ))
            ) : (
              <Text style={modalStyles.empty}>Sin ingredientes</Text>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  root: { flex: 1, paddingHorizontal: 20 },
  navbar: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 8, paddingBottom: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 22, color: C.text, lineHeight: 26 },
  navCenter: { flex: 1, alignItems: 'center', marginHorizontal: 8 },
  navTitle: { fontSize: 17, fontWeight: '600', color: C.text },
  navType: { fontSize: 11, color: C.muted, marginTop: 2 },
  ingredientsBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  ingredientsIcon: { fontSize: 16 },
  progressRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10,
  },
  progressText: { fontSize: 12, fontWeight: '600', color: C.muted, letterSpacing: 1 },
  dotsRow: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: C.border,
  },
  dotActive: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: C.primary,
  },
  scrollContainer: { flex: 1 },
  stepPage: {
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  stepNumberCircleText: {
    fontSize: 28, fontWeight: '700', color: '#fff',
  },
  stepCard: {
    backgroundColor: C.card, borderRadius: 16,
    borderWidth: 1, borderColor: C.border,
    padding: 20, width: '100%', marginBottom: 20,
  },
  stepInstruction: {
    fontSize: 17, color: C.text, lineHeight: 26, textAlign: 'center',
  },
  timerContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 16,
  },
  timerDisplay: {
    backgroundColor: C.primary,
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 10,
  },
  timerText: {
    color: '#fff', fontSize: 20, fontWeight: '700',
    fontFamily: 'monospace',
  },
  timerBtnStart: {
    backgroundColor: C.secondary,
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 10,
  },
  timerBtnStop: {
    backgroundColor: C.danger,
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 10,
  },
  timerBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  navRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingTop: 10, paddingBottom: 16, gap: 12,
  },
  navBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  navBtnPrev: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  navBtnNext: { backgroundColor: C.primary },
  navBtnFinish: { backgroundColor: C.primary },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontSize: 15, fontWeight: '600' },
  navBtnTextDisabled: { color: C.muted },
  navBtnTextFinish: { color: '#fff', fontSize: 15, fontWeight: '600' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 14, color: C.muted },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: C.muted },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 32,
  },
  content: {
    backgroundColor: C.card, borderRadius: 20,
    padding: 24, width: '100%', maxHeight: '70%',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '700', color: C.text },
  closeIcon: { fontSize: 18, color: C.muted, fontWeight: '600' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 10,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: C.primary, marginRight: 12,
  },
  text: { fontSize: 15, color: C.text, flex: 1 },
  empty: { fontSize: 14, color: C.muted, fontStyle: 'italic' },
});
