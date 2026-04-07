import { useRouter } from "expo-router";
import "reflect-metadata";
import LoginScreen from "./vistas/LoginScreen";

export default function Index() {
  const router = useRouter();

  const handleLogin = () => {
    router.replace("/vistas/HomeScreen");
  };

  return <LoginScreen />;
}
