import { Stack } from "expo-router";
import { AuthProvider } from "../presentation/context/AuthContext";
import "reflect-metadata";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="vistas/home" />
        <Stack.Screen name="vistas/inventario" />
        <Stack.Screen name="vistas/recetas" />
        <Stack.Screen name="vistas/receta-detalle" />
        <Stack.Screen name="vistas/generar-receta" />
      </Stack>
    </AuthProvider>
  );
}