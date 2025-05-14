import React from "react";
import { View, Text } from "react-native";
import { styles } from "../home/styles";

export default function MealPlanScreen() {
  return (
    <View style={styles.screenContainer}>
      <Text style={styles.sectionTitle}>Plan de comidas</Text>
      <Text style={styles.info}>Aquí podrás establecer o modificar tu plan de comidas.</Text>
      {/* Aquí puedes agregar un formulario o lista de planes */}
    </View>
  );
}
