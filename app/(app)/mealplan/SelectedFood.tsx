import React, { useState, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { selectedPlanIdAtom } from "../../../atoms/mealPlanAtom";
import { MealType } from "../../../types/mealTypes";
import Header from "../../../components/common/Header";
import useAxiosInstance from "@/hooks/useAxios";
import { Text, View, ScrollView, StyleSheet } from "react-native";

const NUTRITION_LABELS: Record<string, string> = {
  calories_per_100g: "Calorías (por 100g)",
  protein_per_100g: "Proteínas (por 100g)",
  carbohydrates_per_100g: "Carbohidratos (por 100g)",
};

export default function SelectedFood() {
  const { selectedPlanId, selectedMeal } = useLocalSearchParams();
  const [selectedFood, setSelectedFood] = useState<MealType>({
    id: 0,
    name: "",
    description: "",
    calories_per_100g: 0,
    protein_per_100g: 0,
    carbohydrates_per_100g: 0,
  });
  const axiosInstance = useAxiosInstance("food");

  const fetchFoodInfo = async () => {
    try {
      //const response = await axiosInstance.get(`/food/food/${selectedMeal}`);
      //const data = response.data;
      setSelectedFood({
        id: 1,
        name: "Arroz con Pollo",
        description:
          "En este caso es donde se encuentra la información nutricional de la comida y la tengo que mostrar en la primera carta",
        calories_per_100g: 0,
        protein_per_100g: 0,
        carbohydrates_per_100g: 0,
      });
      //setSelectedFood(data);
    } catch (error) {
      console.error("Error fetching food info: ", error);
    }
  };

  useEffect(() => {
    fetchFoodInfo();
  }, [selectedMeal]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />
      <View style={styles.screenContainer}>
        <Text style={styles.title}>{selectedFood.name}</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Card de información general */}
          <View style={styles.card}>
            <Text style={styles.subtitle}>Información General </Text>
            <Text style={styles.foodDesc}>{selectedFood.description}</Text>
          </View>

          {/* Card de información nutricional */}
          <View style={styles.card}>
            <Text style={styles.subtitle}>Información Nutricional</Text>
            {Object.entries(selectedFood)
              .filter(([key]) => NUTRITION_LABELS[key])
              .map(([key, value]) => (
                <View key={key} style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>
                    {NUTRITION_LABELS[key]}:
                  </Text>
                  <Text style={styles.nutritionValue}>{value}</Text>
                </View>
              ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  title: {
    fontSize: 26,
    color: "#287D76",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#287D76",
    textAlign: "center",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: 24,
  },
  foodName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#287D76",
    marginBottom: 8,
  },
  foodDesc: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  nutritionLabel: {
    fontSize: 16,
    color: "#287D76",
    fontWeight: "600",
  },
  nutritionValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
});
