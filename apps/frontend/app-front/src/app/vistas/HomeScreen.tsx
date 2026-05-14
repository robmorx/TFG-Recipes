import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useUserVM } from '../../presentation/viewmodel/UserVM';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SBColors, SBSpacing, SBRadius, SBType, SBFonts, hapticLight, useAlert, ConfirmModal } from '../../presentation/theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const shadowFrap = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.14,
  shadowRadius: 12,
  elevation: 10,
} as const;

type MenuItemProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  iconColor?: string;
};

function MenuItem({ icon, label, subtitle, onPress, iconColor = SBColors.GREEN_ACCENT }: MenuItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      style={[s.menuItem, animatedStyle]}
      onPress={onPress}
      activeOpacity={0.95}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 100 });
        hapticLight();
      }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 200 }); }}
    >
      <View style={s.menuIconBox}>
        <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
      </View>
      <View style={s.menuText}>
        <Text style={s.menuLabel}>{label}</Text>
        {subtitle && <Text style={s.menuSubtitle}>{subtitle}</Text>}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={SBColors.TEXT_BLACK_SOFT} />
    </AnimatedTouchable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useUserVM();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { alertProps, showAlert } = useAlert();

  const handleLogout = () => {
    console.log('[HomeScreen] handleLogout called');
    console.log('[HomeScreen] Current user:', user?.email || user?.name || 'No user');

    if (isLoggingOut) {
      console.log('[HomeScreen] Already logging out, skipping');
      return;
    }

    showAlert({
      title: 'Cerrar Sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      confirmLabel: 'Salir',
      cancelLabel: 'Cancelar',
      confirmDestructive: true,
      icon: 'logout',
      onConfirm: () => {
        console.log('[HomeScreen] Logout confirmed');
        setIsLoggingOut(true);
        console.log('[HomeScreen] Navigating to login screen first...');

        router.replace('/');

        console.log('[HomeScreen] Navigation triggered, calling logout in background...');

        (async () => {
          try {
            console.log('[HomeScreen] Calling logout() from UserVM...');
            await logout();
            console.log('[HomeScreen] logout() completed successfully');
          } catch (error: any) {
            console.error('[HomeScreen] Error during background logout:', error?.message || error);
          } finally {
            setIsLoggingOut(false);
          }
        })();
      },
      onCancel: () => {
        console.log('[HomeScreen] Logout cancelled');
      },
    });
  };

  const fabScale = useSharedValue(1);
  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={SBColors.NEUTRAL_WARM} />
      <View style={s.container}>

         <View style={s.header}>
           <View style={s.avatar}>
             <MaterialCommunityIcons name="account-circle" size={32} color={SBColors.STARBUCKS_GREEN} />
           </View>
           <View style={s.headerText}>
             <Text style={s.greeting}>Hola!</Text>
             <Text style={s.userName}>{user?.name || 'Usuario'}</Text>
           </View>
            <TouchableOpacity
              style={[s.logoutBtn, isLoggingOut && s.logoutBtnDisabled]}
              onPress={handleLogout}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPressIn={hapticLight}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <MaterialCommunityIcons name="loading" size={24} color={SBColors.TEXT_BLACK_SOFT} />
              ) : (
                <MaterialCommunityIcons name="logout" size={24} color={SBColors.TEXT_BLACK_SOFT} />
              )}
            </TouchableOpacity>
         </View>

        <View style={s.welcomeCard}>
          <Text style={s.welcomeTitle}>¿Qué vas a cocinar hoy?</Text>
          <Text style={s.welcomeSub}>Gestiona tu cocina fácilmente</Text>
        </View>

         <View style={s.menuSection}>
           <MenuItem
             icon="carrot"
             label="Inventario"
             subtitle="Ver tus ingredientes"
             onPress={() => router.push('/vistas/InventarioScreen')}
           />
           <MenuItem
             icon="book-open-variant"
             label="Mis Recetas"
             subtitle="Explorar recetas"
             onPress={() => router.push('/vistas/RecetasScreen')}
           />
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

      </View>
      <ConfirmModal {...alertProps} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SBColors.NEUTRAL_WARM },
  container: { flex: 1, paddingHorizontal: SBSpacing.space4, paddingTop: SBSpacing.space4, paddingBottom: SBSpacing.space9 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SBSpacing.space5,
    gap: SBSpacing.space3,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SBColors.GREEN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  greeting: { fontSize: 14, fontFamily: SBFonts.regular, color: SBColors.TEXT_BLACK_SOFT, letterSpacing: SBType.letterSpacingNormal },
  userName: { fontSize: 20, fontFamily: SBFonts.semibold, color: SBColors.STARBUCKS_GREEN, letterSpacing: SBType.letterSpacingNormal },
  logoutBtn: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtnDisabled: {
    opacity: 0.5,
  },
  welcomeCard: {
    backgroundColor: SBColors.HOUSE_GREEN,
    borderRadius: SBRadius.card,
    padding: SBSpacing.space5,
    marginBottom: SBSpacing.space5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.24,
    shadowRadius: 1,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 18,
    fontFamily: SBFonts.semibold,
    color: SBColors.WHITE,
    marginBottom: 4,
    letterSpacing: SBType.letterSpacingNormal,
  },
  welcomeSub: {
    fontSize: 13,
    fontFamily: SBFonts.regular,
    color: SBColors.TEXT_WHITE_SOFT,
    letterSpacing: SBType.letterSpacingNormal,
  },
  menuSection: { gap: SBSpacing.space3 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SBColors.WHITE,
    borderRadius: SBRadius.card,
    paddingVertical: SBSpacing.space3,
    paddingHorizontal: SBSpacing.space3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.24,
    shadowRadius: 1,
    elevation: 2,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: SBColors.NEUTRAL_WARM,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SBSpacing.space3,
  },
  menuText: { flex: 1 },
  menuLabel: {
    fontSize: 16,
    fontFamily: SBFonts.semibold,
    color: SBColors.TEXT_BLACK,
    letterSpacing: SBType.letterSpacingNormal,
  },
  menuSubtitle: {
    fontSize: 12,
    fontFamily: SBFonts.regular,
    color: SBColors.TEXT_BLACK_SOFT,
    marginTop: 2,
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
