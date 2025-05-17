import React from "react";
import { View, Text } from "react-native";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { homeStyles } from "../../../styles/homeStyles";

export default function HomeScreen() {
  const [auth] = useAtom(authenticatedAtom);
  return (
    <View style={homeStyles.screenContainer}>
      <Text style={homeStyles.welcome}>¡Bienvenido/a, {auth?.username || 'usuario'}!</Text>
      <Text style={homeStyles.info}>Aquí verás tu resumen y novedades.</Text>
    </View>
  );
}
