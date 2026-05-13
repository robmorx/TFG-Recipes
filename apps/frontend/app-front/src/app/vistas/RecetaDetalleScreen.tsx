import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
  SafeAreaView, StatusBar, Modal, useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Recipe, RecipeStep, RecipeType } from '../../domain/entities/recipe';
import { container } from '../../core/container';
import { IRecipeUseCase } from '../../domain/interfaces/IRecipeUseCase';
import { TYPES } from '../../core/TYPES';
import { ThemedButton, ThemedCard, SBColors, SBSpacing, SBType, SBFonts, hapticLight } from '../../presentation/theme';
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

function AnimatedNavBtn({
  label,
  onPress,
  variant,
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant: 'prev' | 'next' | 'finish';
  disabled?: boolean;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  let btnStyle: ViewStyle = s.navBtnPrev;
  let textColor = SBColors.TEXT_BLACK;

  if (variant === 'next' || variant === 'finish') {
    btnStyle = s.navBtnNext;
    textColor = SBColors.WHITE;
  }

  return (
    <AnimatedTouchable
      style={[s.navBtn, btnStyle, disabled && s.navBtnDisabled, animatedStyle]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.95}
      onPressIn={() => {
        !disabled && (scale.value = withTiming(0.95, { duration: 100 }));
        !disabled && hapticLight();
      }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 200 }); }}
    >
      <Text style={[s.navBtnText, disabled && s.navBtnTextDisabled, { color: textColor }]}>
        {label}
      </Text>
    </AnimatedTouchable>
  );
}

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
        <StatusBar barStyle="dark-content" backgroundColor={SBColors.NEUTRAL_WARM} />
        <View style={s.root}>
          <View style={s.navbar}>
            <AnimatedBackBtn onPress={() => router.back()} />
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
         <StatusBar barStyle="dark-content" backgroundColor={SBColors.NEUTRAL_WARM} />
         <View style={s.root}>
           <View style={s.navbar}>
             <AnimatedBackBtn onPress={() => router.back()} />
             <Text style={s.navTitle}>Detalle</Text>
             <View style={{ width: 36 }} />
           </View>
           <View style={s.empty}>
             <MaterialCommunityIcons name="magnify" size={48} color={SBColors.TEXT_BLACK_SOFT} style={s.emptyIcon} />
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

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={SBColors.NEUTRAL_WARM} />
      <View style={s.root}>
         <View style={s.navbar}>
           <AnimatedBackBtn onPress={() => router.back()} />
           <View style={s.navCenter}>
             <Text style={s.navTitle} numberOfLines={1}>{recipe.name || 'Receta'}</Text>
             {typeInfo && (
               <View style={s.navTypeRow}>
                 <MaterialCommunityIcons name={typeInfo.icon} size={14} color={SBColors.TEXT_BLACK_SOFT} style={s.navTypeIcon} />
                 <Text style={s.navType}>{typeInfo.label}</Text>
               </View>
             )}
           </View>
           <TouchableOpacity
             onPress={() => setShowIngredients(true)}
             style={s.ingredientsBtn}
             activeOpacity={0.7}
             onPressIn={hapticLight}
           >
             <MaterialCommunityIcons name="basket-outline" size={20} color={SBColors.TEXT_BLACK} />
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

                <ThemedCard padding="lg" style={s.stepCard}>
                  <Text style={s.stepInstruction}>{step.instruction}</Text>
                </ThemedCard>

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
                        <ThemedButton
                          variant="primary-filled"
                          label="⏹ Detener"
                          onPress={() => stopTimer(i)}
                          fullWidth={false}
                          style={s.timerBtnStop}
                        />
                      </>
                    ) : (
                      <ThemedButton
                        variant="primary-outlined"
                        label={`⏱ Iniciar Timer (${step.timerMinutes} min)`}
                        onPress={() => startTimer(i, step.timerMinutes)}
                        fullWidth={false}
                        style={s.timerBtnStart}
                      />
                    )}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={s.navRow}>
          <AnimatedNavBtn
            label="← Anterior"
            variant="prev"
            onPress={() => goToStep(currentStep - 1)}
            disabled={isFirstStep}
          />

          {isLastStep ? (
            <ThemedButton
              variant="primary-filled"
              label="✓ Completar"
              onPress={() => router.back()}
              fullWidth={false}
              style={s.navBtnFinish}
            />
          ) : (
            <AnimatedNavBtn
              label="Siguiente →"
              variant="next"
              onPress={() => goToStep(currentStep + 1)}
            />
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
           <ThemedCard padding="lg" style={modalStyles.content}>
             <View style={modalStyles.header}>
               <Text style={modalStyles.title}>Ingredientes</Text>
               <TouchableOpacity
                 onPress={() => setShowIngredients(false)}
                 onPressIn={hapticLight}
               >
                 <MaterialCommunityIcons name="close" size={22} color={SBColors.TEXT_BLACK_SOFT} />
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
          </ThemedCard>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SBColors.NEUTRAL_WARM },
  root: { flex: 1, paddingHorizontal: SBSpacing.outerGutter },
  navbar: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 8, paddingBottom: 10,
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
  navCenter: { flex: 1, alignItems: 'center', marginHorizontal: 8 },
  navTitle: {
    fontSize: 17,
    fontFamily: SBFonts.semibold,
    color: SBColors.STARBUCKS_GREEN,
    letterSpacing: SBType.letterSpacingNormal,
  },
  navTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  navTypeIcon: {
    marginRight: 4,
  },
  navType: {
    fontSize: 11,
    fontFamily: SBFonts.regular,
    color: SBColors.TEXT_BLACK_SOFT,
    letterSpacing: SBType.letterSpacingNormal,
  },
  ingredientsBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: SBColors.WHITE, borderWidth: 1, borderColor: SBColors.CERAMIC,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 0.5,
    elevation: 1,
  },
  ingredientsIcon: { fontSize: 16 },
  progressRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10,
  },
  progressText: {
    fontSize: 12,
    fontFamily: SBFonts.semibold,
    color: SBColors.TEXT_BLACK_SOFT,
    letterSpacing: 1,
  },
  dotsRow: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: SBColors.CERAMIC,
  },
  dotActive: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: SBColors.GREEN_ACCENT,
  },
  scrollContainer: { flex: 1 },
  stepPage: {
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: SBColors.GREEN_ACCENT,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SBSpacing.space6,
  },
  stepNumberCircleText: {
    fontSize: 28,
    fontFamily: SBFonts.bold,
    color: SBColors.WHITE,
  },
  stepCard: {
    width: '100%',
    marginBottom: SBSpacing.space5,
  },
  stepInstruction: {
    fontSize: 17,
    fontFamily: SBFonts.regular,
    color: SBColors.TEXT_BLACK,
    lineHeight: 26,
    textAlign: 'center',
    letterSpacing: SBType.letterSpacingNormal,
  },
  timerContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: SBSpacing.space4,
  },
  timerDisplay: {
    backgroundColor: SBColors.GREEN_ACCENT,
    paddingHorizontal: SBSpacing.space5, paddingVertical: 10,
    borderRadius: 50,
  },
  timerText: {
    color: SBColors.WHITE,
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  timerBtnStart: {
    paddingHorizontal: SBSpacing.space4,
  },
  timerBtnStop: {
    backgroundColor: SBColors.RED,
    paddingHorizontal: SBSpacing.space4,
  },
  navRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingTop: 10, paddingBottom: 16, gap: 12,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnPrev: {
    backgroundColor: SBColors.WHITE,
    borderWidth: 1,
    borderColor: SBColors.CERAMIC,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 0.5,
    elevation: 1,
  },
  navBtnNext: {
    backgroundColor: SBColors.GREEN_ACCENT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.24,
    shadowRadius: 1,
    elevation: 2,
  },
  navBtnFinish: {
    flex: 1,
  },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: {
    fontSize: 15,
    fontFamily: SBFonts.semibold,
    letterSpacing: SBType.letterSpacingNormal,
  },
  navBtnTextDisabled: { color: SBColors.TEXT_BLACK_SOFT },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: {
    fontSize: 14, color: SBColors.TEXT_BLACK_SOFT,
    fontFamily: SBFonts.regular,
    letterSpacing: SBType.letterSpacingNormal,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { marginBottom: 12 },
  emptyText: {
    fontSize: 15, color: SBColors.TEXT_BLACK_SOFT,
    fontFamily: SBFonts.regular,
    letterSpacing: SBType.letterSpacingNormal,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 32,
  },
  content: {
    width: '100%', maxHeight: '70%',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SBSpacing.space4,
  },
  title: {
    fontSize: 18,
    fontFamily: SBFonts.bold,
    color: SBColors.STARBUCKS_GREEN,
    letterSpacing: SBType.letterSpacingNormal,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 10,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: SBColors.GREEN_ACCENT, marginRight: 12,
  },
  text: {
    fontSize: 15, color: SBColors.TEXT_BLACK, flex: 1,
    fontFamily: SBFonts.regular,
    letterSpacing: SBType.letterSpacingNormal,
  },
  empty: {
    fontSize: 14,
    color: SBColors.TEXT_BLACK_SOFT,
    fontStyle: 'italic',
    fontFamily: SBFonts.regular,
  },
});
