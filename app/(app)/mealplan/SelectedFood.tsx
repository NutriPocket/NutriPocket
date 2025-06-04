import React, { useState, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { selectedPlanIdAtom } from "../../../atoms/mealPlanAtom";
import { IngredientType, MealType } from "../../../types/mealTypes";
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
    carbs_per_100g: 0,
    fiber_per_100g: 0,
    saturated_fats_per_100g: 0,
    monounsaturated_fats_per_100g: 0,
    polyunsaturated_fats_per_100g: 0,
    trans_fats_per_100g: 0,
    cholesterol_per_100g: 0,
  });
  const axiosInstance = useAxiosInstance("food");
  const [selectedFoodIngredients, setSelectedFoodIngredients] = useState<
    string[]
  >([]);

  const fetchFoodInfo = async () => {
    try {
      const response = await axiosInstance.get(`/foods/${selectedMealId}`);
      const data = response.data.data;
      setSelectedFood(data);
      console.log("Selected food data:   ", data);
    } catch (error) {
      console.error("Error fetching food info: ", error);
    }
  };

  const fetchFoodIngredients = async () => {
    if (!selectedMealId) return;

    try {
      const response = await axiosInstance.get(
        `/foods/${selectedMealId}/ingredients`
      );
      const ingredients = response.data.data;
      setSelectedFoodIngredients(ingredients);
    } catch (error) {
      console.error("Error fetching food ingredients: ", error);
    }
  };

  useEffect(() => {
    fetchFoodInfo();
    fetchFoodIngredients();
  }, [selectedMealId]);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await axiosInstance.get(
          `/foods/${selectedMealId}/ingredients`
        );
        if (response.data && response.data.data) {
          setSelectedFood((prev) => ({
            ...prev,
            ingredients: response.data.data,
          }));
        }
      } catch (error) {
        // No mostrar error si no hay ingredientes
      }
    };
    if (selectedMealId) {
      fetchIngredients();
    }
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
                  <Text style={styles.nutritionValue}>
                    {Array.isArray(value) || value === null ? "" : value}
                  </Text>
                </View>
              ))}
          </View>

          {/* Card de ingredientes y cantidades recomendadas */}
          <View style={styles.card}>
            <Text style={styles.subtitle}>Ingredientes y Cantidades</Text>
            {Array.isArray(selectedFood.ingredients) &&
            selectedFood.ingredients.length > 0 ? (
              <View style={{ gap: 8 }}>
                {food.map((ingredient, idx) => (
                  <View key={idx} style={styles.ingredientRow}>
                    <Text style={styles.ingredientName}>{ingredient.name}</Text>
                    <Text style={styles.ingredientQty}>
                      {ingredient.amount}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.ingredientQty}>
                No hay ingredientes registrados.
              </Text>
            )}
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
