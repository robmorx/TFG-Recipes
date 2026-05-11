import { Stack } from "expo-router";
import { AuthProvider } from "../presentation/context/AuthContext";
import "reflect-metadata";

export default function RootLayout() {
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
        <Stack.Screen name="vistas/VerifyAccountScreen" />
        <Stack.Screen name="vistas/ForgotPasswordScreen" />
        <Stack.Screen name="vistas/VerifyResetCodeScreen" />
        <Stack.Screen name="vistas/ResetPasswordScreen" />
      </Stack>
    </AuthProvider>
  );
}