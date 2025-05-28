import React, { useState, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { selectedPlanIdAtom } from "../../../atoms/mealPlanAtom";
import { MealType } from "../../../types/mealTypes";
import Header from "../../../components/Header";
import useAxiosInstance from "@/hooks/useAxios";
import { Text, View, ScrollView, StyleSheet } from "react-native";

const NUTRITION_LABELS: Record<string, string> = {
  calories_per_100g: "Calorías (por 100g)",
  protein_per_100g: "Proteínas (por 100g)",
  carbohydrates_per_100g: "Carbohidratos (por 100g)",
  fiber_per_100g: "Fibra (por 100g)",
  saturated_fats_per_100g: "Grasas Saturadas (por 100g)",
  monounsaturated_fats_per_100g: "Grasas Monoinsaturadas (por 100g)",
  polyunsaturated_fats_per_100g: "Grasas Poliinsaturadas (por 100g)",
  trans_fats_per_100g: "Grasas Trans (por 100g)",
  cholesterol_per_100g: "Colesterol (por 100g)",
};

export default function SelectedFood() {
  const { selectedMealId } = useLocalSearchParams();
  const [selectedFood, setSelectedFood] = useState<MealType>({
    id: 0,
    name: "",
    description: "",
    calories_per_100g: 0,
    protein_per_100g: 0,
    carbohydrates_per_100g: 0,
    fiber_per_100g: 0,
    saturated_fats_per_100g: 0,
    monounsaturated_fats_per_100g: 0,
    polyunsaturated_fats_per_100g: 0,
    trans_fats_per_100g: 0,
    cholesterol_per_100g: 0,
  });
  const axiosInstance = useAxiosInstance("food");

  const fetchFoodInfo = async () => {
    try {
      const response = await axiosInstance.get(`/foods/${selectedMealId}`);
      const data = response.data.data;
      setSelectedFood(data);
      console.log("Selected food data: ", data);
    } catch (error) {
      console.error("Error fetching food info: ", error);
    }
  };

  useEffect(() => {
    fetchFoodInfo();
  }, [selectedMealId]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />
      <View style={styles.screenContainer}>
        <Text style={styles.title}>{selectedFood.name}</Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            gap: 24,
          }}
        >
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

          {/* Card de ingredientes y cantidades recomendadas (hardcodeado) */}
          <View style={styles.card}>
            <Text style={styles.subtitle}>Ingredientes y Cantidades</Text>
            <View style={{ gap: 8 }}>
              <View style={styles.ingredientRow}>
                <Text style={styles.ingredientName}>Pollo</Text>
                <Text style={styles.ingredientQty}>150g</Text>
              </View>
              <View style={styles.ingredientRow}>
                <Text style={styles.ingredientName}>Arroz</Text>
                <Text style={styles.ingredientQty}>100g</Text>
              </View>
              <View style={styles.ingredientRow}>
                <Text style={styles.ingredientName}>Aceite de oliva</Text>
                <Text style={styles.ingredientQty}>1 cda</Text>
              </View>
              <View style={styles.ingredientRow}>
                <Text style={styles.ingredientName}>Sal</Text>
                <Text style={styles.ingredientQty}>a gusto</Text>
              </View>
            </View>
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
  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  ingredientName: {
    fontSize: 16,
    color: "#287D76",
  },
  ingredientQty: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
});
