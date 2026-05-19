import { Stack } from "expo-router";
import { AuthProvider } from "../presentation/context/AuthContext";
import "reflect-metadata";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { View, Text, StyleSheet } from "react-native";
import { SBColors, SBFonts, SBType } from "../presentation/theme";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return (
      <View style={s.loadingContainer}>
        <Text style={s.loadingText}>CeroSobras</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="vistas/LoginScreen" />
        <Stack.Screen name="vistas/HomeScreen" />
        <Stack.Screen name="vistas/InventarioScreen" />
        <Stack.Screen name="vistas/RecetasScreen" />
        <Stack.Screen name="vistas/RecetaDetalleScreen" />
        <Stack.Screen name="vistas/CrearRecetaScreen" />
        <Stack.Screen name="vistas/RegisterScreen" />
        <Stack.Screen name="vistas/ForgotPasswordScreen" />
        <Stack.Screen name="vistas/VerifyResetCodeScreen" />
        <Stack.Screen name="vistas/ResetPasswordScreen" />
      </Stack>
    </AuthProvider>
  );
}

const s = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: SBColors.NEUTRAL_WARM,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 24,
    fontFamily: SBFonts.bold,
    color: SBColors.GREEN_ACCENT,
    letterSpacing: SBType.letterSpacingNormal,
  },
});