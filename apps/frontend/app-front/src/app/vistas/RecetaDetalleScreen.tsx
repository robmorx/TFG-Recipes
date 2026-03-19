import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useState } from 'react';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const COLORS = {
  background: '#F5F0E8',
  card: '#FDFAF4',
  cardAlt: '#EDE8DF',
  primary: '#3A6EA5',
  primaryLight: '#EAF1FA',
  text: '#1C1C1E',
  textMuted: '#8A8A8E',
  border: '#E0D9CC',
  stepBg: '#3A6EA5',
};

type Recipe = {
  name: string;
  ingredients: string[];
  steps: string[];
};

type Props = {
  recipe?: Recipe;
  onBack?: () => void;
};

const MOCK_RECIPE: Recipe = {
  name: 'Pollo al limón',
  ingredients: [
    'Pechuga de pollo',
    'Limón',
    'Ajo',
    'Aceite de oliva',
    'Romero',
    'Sal y pimienta',
  ],
  steps: [
    'Precalienta el horno a 200°C. Limpia y seca las pechugas de pollo con papel de cocina.',
    'Mezcla el zumo de limón, ajo picado, aceite de oliva, sal, pimienta y romero en un bol.',
    'Marina el pollo con la mezcla durante al menos 30 minutos en la nevera.',
    'Coloca el pollo en una bandeja de horno y hornea durante 25-30 minutos.',
    'Deja reposar 5 minutos antes de servir. Decora con rodajas de limón fresco.',
  ],
};

type CollapsibleSectionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

function CollapsibleSection({ title, children, defaultOpen = true }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(prev => !prev);
  };

  return (
    <View style={sectionStyles.container}>
      <TouchableOpacity style={sectionStyles.header} onPress={toggle} activeOpacity={0.75}>
        <Text style={sectionStyles.title}>{title}</Text>
        <Text style={sectionStyles.chevron}>{open ? '∧' : '∨'}</Text>
      </TouchableOpacity>
      {open && <View style={sectionStyles.body}>{children}</View>}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  chevron: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  body: {
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
});

export default function RecetaDetalleScreen({ recipe = MOCK_RECIPE, onBack }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = recipe.steps.length;

  const goNext = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
  const goPrev = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>

        {/* Navbar */}
        <View style={styles.navbar}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle} numberOfLines={1}>{recipe.name}</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🍽️</Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{totalSteps} pasos</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Detalles / Ingredientes */}
          <CollapsibleSection title="Detalles" defaultOpen>
            {recipe.ingredients.map((ing, i) => (
              <View key={i} style={styles.ingredientItem}>
                <View style={styles.ingredientBullet} />
                <Text style={styles.ingredientText}>{ing}</Text>
              </View>
            ))}
          </CollapsibleSection>

          {/* Proceso / Paso actual */}
          <CollapsibleSection title="Proceso" defaultOpen={false}>
            <Text style={styles.processText}>{recipe.steps[currentStep]}</Text>
          </CollapsibleSection>

          {/* Step navigator */}
          <View style={styles.stepNav}>
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnOutline, currentStep === 0 && styles.navBtnDisabled]}
              onPress={goPrev}
              disabled={currentStep === 0}
              activeOpacity={0.8}
            >
              <Text style={[styles.navBtnTextOutline, currentStep === 0 && styles.navBtnTextDisabled]}>
                ← Atrás
              </Text>
            </TouchableOpacity>

            <View style={styles.stepIndicator}>
              {recipe.steps.map((_, i) => (
                <View
                  key={i}
                  style={[styles.stepDot, i === currentStep && styles.stepDotActive]}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnFilled, currentStep === totalSteps - 1 && styles.navBtnDisabled]}
              onPress={goNext}
              disabled={currentStep === totalSteps - 1}
              activeOpacity={0.8}
            >
              <Text style={styles.navBtnTextFilled}>
                Paso {currentStep + 2 <= totalSteps ? currentStep + 2 : '✓'} →
              </Text>
            </TouchableOpacity>
          </View>

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
    paddingBottom: 14,
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
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: COLORS.cardAlt,
    borderRadius: 18,
    paddingVertical: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  heroEmoji: {
    fontSize: 56,
  },
  heroBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  scroll: {
    paddingBottom: 32,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  ingredientBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 10,
  },
  ingredientText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '400',
    lineHeight: 20,
  },
  processText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    fontWeight: '400',
  },
  stepNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  navBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 100,
    alignItems: 'center',
  },
  navBtnOutline: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  navBtnFilled: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  navBtnDisabled: {
    opacity: 0.35,
    shadowOpacity: 0,
    elevation: 0,
  },
  navBtnTextOutline: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  navBtnTextFilled: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  navBtnTextDisabled: {
    color: COLORS.textMuted,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  stepDotActive: {
    width: 18,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
});
