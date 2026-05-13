import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, StatusBar, Alert,
} from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUserVM } from '../../presentation/viewmodel/UserVM';
import { ThemedButton, ThemedCard, SBColors, SBSpacing, SBType, SBFonts, hapticLight } from '../../presentation/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

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

export default function VerifyAccountScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyAccount, isLoading } = useUserVM();
  const [code, setCode] = useState('');

  const handleVerify = async () => {
    if (!code.trim() || code.length < 6) return;
    try {
      await verifyAccount(decodeURIComponent(email), code.trim());
      Alert.alert('Cuenta verificada', 'Tu cuenta ha sido verificada exitosamente', [
        { text: 'OK', onPress: () => router.replace('/vistas/LoginScreen') },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Código inválido');
    }
  };

  const handleBack = () => {
    router.replace('/vistas/LoginScreen');
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={SBColors.NEUTRAL_WARM} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.inner}
      >
        <View style={s.navbar}>
          <AnimatedBackBtn onPress={handleBack} />
          <Text style={s.navTitle}>Verificar cuenta</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={s.logoSection}>
          <MaterialCommunityIcons name="email-outline" size={56} color={SBColors.STARBUCKS_GREEN} style={s.logoIcon} />
          <Text style={s.logoSubtitle}>
            Hemos enviado un código de 6 dígitos a tu email
          </Text>
        </View>

        <ThemedCard padding="lg">
          <View style={s.field}>
            <Text style={s.label}>Código de verificación</Text>
            <TextInput
              style={s.codeInput}
              placeholder="Ingresa el código"
              placeholderTextColor={SBColors.TEXT_BLACK_SOFT}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <View style={s.btnWrapper}>
            <ThemedButton
              variant="primary-filled"
              label={isLoading ? 'Verificando...' : 'Verificar'}
              onPress={handleVerify}
              disabled={code.length < 6 || isLoading}
              loading={isLoading}
              fullWidth
            />
          </View>
        </ThemedCard>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: SBColors.NEUTRAL_WARM },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: SBSpacing.outerGutter },
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
  logoSection: { alignItems: 'center', marginBottom: SBSpacing.space6 },
  logoIcon: { marginBottom: SBSpacing.space3 },
  logoSubtitle: {
    fontSize: 14,
    fontFamily: SBFonts.regular,
    color: SBColors.TEXT_BLACK_SOFT,
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: SBType.letterSpacingNormal,
  },
  field: { marginBottom: SBSpacing.space3 },
  label: {
    fontSize: 13,
    fontFamily: SBFonts.semibold,
    color: SBColors.TEXT_BLACK,
    marginBottom: 6,
    letterSpacing: SBType.letterSpacingNormal,
  },
  codeInput: {
    backgroundColor: SBColors.NEUTRAL_WARM,
    borderRadius: 12,
    paddingHorizontal: SBSpacing.space3,
    paddingVertical: 14,
    fontSize: 24,
    fontFamily: SBFonts.regular,
    color: SBColors.TEXT_BLACK,
    borderWidth: 1,
    borderColor: SBColors.CERAMIC,
    textAlign: 'center',
    letterSpacing: 8,
  },
  btnWrapper: {
    marginTop: SBSpacing.space2,
  },
});
