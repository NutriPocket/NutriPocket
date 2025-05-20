import React, { useState } from "react";
import { View, Text, Button, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import useAxiosInstance from "@/hooks/useAxios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const INTERESES = [
  "Vegetariano",
  "Sin gluten",
  "Alto en proteínas",
  "Bajo en carbohidratos",
  // ...otros intereses
];

export default function PlanPreferences() {
  const [selected, setSelected] = useState<string[]>([]);
  const axiosInstance = useAxiosInstance('food');

  const toggleInterest = (interest: string) => {
    setSelected((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleCreate = async () => {
    // POST para crear la dieta/grupo según preferencias
    const response = await axiosInstance.post("/food/plans/create-by-preferences", {
      preferences: selected,
    });
    // Supón que el backend te devuelve el id del plan creado
    const planId = response.data.id_plan;
    // Navega a la pantalla de visualización del plan
    router.push({ pathname: "/mealplan/PlanView", params: { planId } });
  };

  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Text style={{ fontSize: 20, marginBottom: 16 }}>Elegí tus intereses</Text>
      {INTERESES.map((interest) => (
        <TouchableOpacity
          key={interest}
          onPress={() => toggleInterest(interest)}
          style={{
            padding: 12,
            marginVertical: 6,
            backgroundColor: selected.includes(interest) ? "#287D76" : "#eee",
            borderRadius: 8,
          }}
        >
          <Text style={{ color: selected.includes(interest) ? "#fff" : "#333" }}>
            {interest}
          </Text>
        </TouchableOpacity>
      ))}
      <Button
        title="Crear dieta"
        onPress={handleCreate}
        disabled={selected.length === 0}
      />
    </View>
  );
}