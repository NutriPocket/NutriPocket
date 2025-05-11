import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Oculta el encabezado en todas las pantallas
      }}
    />
  );
}
