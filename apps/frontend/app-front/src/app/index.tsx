import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../presentation/context/AuthContext";
import { SBColors, SBFonts, SBType } from "../presentation/theme";
import "reflect-metadata";
import LoginScreen from "./vistas/LoginScreen";

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/vistas/HomeScreen");
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <View style={s.splashContainer}>
        <MaterialCommunityIcons
          name="food-variant"
          size={64}
          color={SBColors.STARBUCKS_GREEN}
        />
        <Text style={s.splashTitle}>CeroSobras</Text>
        <ActivityIndicator
          size="large"
          color={SBColors.GREEN_ACCENT}
          style={{ marginTop: 24 }}
        />
      </View>
    );
  }

  return <LoginScreen />;
}

const s = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: SBColors.NEUTRAL_WARM,
    alignItems: "center",
    justifyContent: "center",
  },
  splashTitle: {
    fontSize: 28,
    fontFamily: SBFonts.bold,
    color: SBColors.STARBUCKS_GREEN,
    marginTop: 16,
    letterSpacing: SBType.letterSpacingNormal,
  },
});
