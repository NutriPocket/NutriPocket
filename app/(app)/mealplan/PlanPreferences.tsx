import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Button } from "react-native-paper";
import { router } from "expo-router";
import useAxiosInstance from "@/hooks/useAxios";

const INTERESES = [
  "Vegetariano",
  "Sin gluten",
  "Alto en proteínas",
  "Bajo en carbohidratos",
  // ...otros intereses
];

export default function PlanPreferences() {
  const [selected, setSelected] = useState<string[]>([]);
  const axiosInstance = useAxiosInstance("food");

  const toggleInterest = (interest: string) => {
    setSelected((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleCreate = async () => {
    // POST para crear la dieta/grupo según preferencias
    try {
      const response = await axiosInstance.post(
        "/food/plans/create-by-preferences",
        {
          preferences: selected,
        }
      );

      // Navega a la pantalla de visualización del plan
      router.push({ pathname: "/mealplan/PlanView" });
    } catch (error) {
      console.error("Error al crear el plan:", error);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 100,
        paddingHorizontal: 24,
        alignContent: "center",

        gap: 20,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          textAlign: "center",
          color: "#287D76",
          fontWeight: "bold",
        }}
      >
        Elegí tus intereses
      </Text>
      {INTERESES.map((interest) => (
        <TouchableOpacity
          key={interest}
          onPress={() => toggleInterest(interest)}
          style={{
            padding: 12,
            backgroundColor: selected.includes(interest) ? "#287D76" : "#eee",
            borderRadius: 8,
          }}
        >
          <Text
            style={{ color: selected.includes(interest) ? "#fff" : "#333" }}
          >
            {interest}
          </Text>
        </TouchableOpacity>
      ))}
      <Button
        mode="contained"
        onPress={() => handleCreate()}
        style={styles.planButtonCreate}
      >
        Crear Plan
      </Button>
    </View>
  );
}

import type { ViewStyle } from "react-native";

const styles: { planButtonCreate: ViewStyle } = {
  planButtonCreate: {
    backgroundColor: "#287D76",
    justifyContent: "center",
    alignItems: "center",
  },
};
