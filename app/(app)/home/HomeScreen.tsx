import React from "react";
import { View, Text } from "react-native";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { styles } from "./styles";

export default function HomeScreen() {
  const [auth] = useAtom(authenticatedAtom);
  return (
    <View style={styles.screenContainer}>
      <Text style={styles.welcome}>¡Bienvenido/a, {auth?.username || 'usuario'}!</Text>
      <Text style={styles.info}>Aquí verás tu resumen y novedades.</Text>
    </View>
  );
}
