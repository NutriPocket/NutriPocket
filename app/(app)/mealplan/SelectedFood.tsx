import React, { useState, useCallback } from "react";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import {
  MealType,
  IngredientType,
  MealTypeWithNutrients,
} from "../../../types/mealTypes";
import Header from "../../../components/Header";
import useAxiosInstance from "@/hooks/useAxios";
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const NUTRITION_LABELS: Record<string, string> = {
  calories: "Calorías ",
  protein: "Proteínas ",
  carbs: "Carbohidratos ",
  fiber: "Fibra ",
  saturated_fats: "Grasas Saturadas ",
  monounsaturated_fats: "Grasas Monoinsaturadas ",
  polyunsaturated_fats: "Grasas Poliinsaturadas ",
  trans_fats: "Grasas Trans ",
  cholesterol: "Colesterol ",
};

// Unidades para cada campo nutricional
const NUTRITION_UNITS: Record<string, string> = {
  calories: "cal",
  protein: "g",
  carbs: "g",
  fiber: "g",
  saturated_fats: "g",
  monounsaturated_fats: "g",
  polyunsaturated_fats: "g",
  trans_fats: "g",
  cholesterol: "mg",
};

export default function SelectedFood() {
  const { selectedMealId } = useLocalSearchParams();
  const [ingredients, setIngredients] = useState<IngredientType[]>([]);
  const [selectedFood, setSelectedFood] = useState<MealTypeWithNutrients>({
    id: 0,
    name: "",
    description: "",
    image_url: "",
    price: 0,
    ingredients: [],
    calories: 0,
    protein: 0,
    carbs: 0,
    fiber: 0,
    saturated_fats: 0,
    monounsaturated_fats: 0,
    polyunsaturated_fats: 0,
    trans_fats: 0,
    cholesterol: 0,
  });
  const axiosInstance = useAxiosInstance("food");

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
    try {
      const response = await axiosInstance.get(
        `/foods/${selectedMealId}/ingredients`
      );

      const apiIngredients = response.data.data;
      const parsedIngredients: IngredientType[] = apiIngredients.map(
        (item: any) => ({
          ...item.ingredient,
          quantity: item.quantity,
        })
      );

      setIngredients(parsedIngredients);
      console.log("Selected food ingredients: ", parsedIngredients);
    } catch (error) {
      console.error("Error fetching food info: ", error);
    }
  };

  const fetchFoodNutritionalInfo = async () => {
    try {
      const response = await axiosInstance.get(
        `/foods/${selectedMealId}/nutrition`
      );
      const data = response.data.data;
      setSelectedFood((prev) => ({
        ...prev,
        ...data,
      }));
      console.log("Selected food nutritional info: ", data);
    } catch (error) {
      console.error("Error fetching food nutritional info: ", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFoodInfo();
      fetchFoodNutritionalInfo();
      fetchFoodIngredients();
    }, [])
  );

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
          <View>
            <View style={styles.imageContainer}>
              {selectedFood.image_url &&
              selectedFood.image_url.trim() !== "" &&
              selectedFood.image_url !== null ? (
                <Image
                  source={{ uri: selectedFood.image_url }}
                  style={styles.foodImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.foodImage, styles.noImageCircle]}>
                  <Text style={styles.noImageText}>Sin imagen</Text>
                </View>
              )}
            </View>
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
                .map(([key, value]) => {
                  // Determinar la unidad para cada nutriente
                  let unit = "";
                  switch (key) {
                    case "calories":
                      unit = "(cal)";
                      break;
                    case "cholesterol":
                      unit = "(mg)";
                      break;
                    default:
                      unit = "(g)";
                  }
                  return (
                    <View key={key} style={styles.nutritionRow}>
                      <Text style={styles.nutritionLabel}>
                        {NUTRITION_LABELS[key]}:
                      </Text>
                      <Text style={styles.nutritionValue}>
                        {typeof value === "number"
                          ? value.toFixed(2)
                          : typeof value === "string"
                          ? value
                          : ""}
                        {unit}
                      </Text>
                    </View>
                  );
                })}
            </View>

            {/* Card de ingredientes y cantidades recomendadas */}
            <View style={styles.card}>
              <Text style={styles.subtitle}>Ingredientes y Cantidades</Text>
              {/* Cantidad total a consumir */}
              <View style={styles.totalAmountContainer}>
                <Text style={styles.totalAmountLabel}>
                  Cantidad total a consumir:
                </Text>
                <Text style={styles.totalAmountValue}>
                  {ingredients.length > 0
                    ? `${ingredients
                        .reduce(
                          (acc, ing) =>
                            acc +
                            (typeof ing.quantity === "number"
                              ? ing.quantity
                              : 0),
                          0
                        )
                        .toFixed(2)} g`
                    : "-"}
                </Text>
              </View>

              <View style={styles.divider} />
              {ingredients.map((ingredient) => {
                let unit = ingredient.measure_type;
                if (unit === "gram") unit = "g";
                else if (unit === "unit") unit = "unidad";
                return (
                  <View key={ingredient.name} style={styles.ingredientRow}>
                    <Text style={styles.ingredientName}>{ingredient.name}</Text>
                    <Text style={styles.ingredientQty}>
                      {ingredient.quantity} {unit ? `(${unit})` : ""}
                    </Text>
                  </View>
                );
              })}
              {/* Botón para agregar nuevo ingrediente */}
              <TouchableOpacity
                style={styles.addIngredientButton}
                onPress={() =>
                  router.push({
                    pathname: "/mealplan/AddIngredientToFood",
                    params: { selectedMealId },
                  })
                }
                accessibilityLabel="Agregar nuevo ingrediente"
              >
                <MaterialIcons name="add" size={22} color="#fff" />
                <Text style={styles.addIngredientButtonText}>
                  Agregar nuevo ingrediente
                </Text>
              </TouchableOpacity>
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
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#287D76",
    textAlign: "center",
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 24,
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
    fontWeight: "600",
  },
  ingredientQty: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  totalAmountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#e6f7f5",
    borderRadius: 8,
    padding: 10,
  },
  totalAmountLabel: {
    fontSize: 16,
    color: "#287D76",
    fontWeight: "600",
  },
  totalAmountValue: {
    fontSize: 16,
    color: "#287D76",
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#b2dfdb",
    marginVertical: 10,
    borderRadius: 1,
  },
  foodImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  noImageCircle: {
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  noImageText: {
    fontSize: 14,
    color: "#888",
    fontWeight: "bold",
    textAlign: "center",
  },
  addIngredientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#287D76",
    borderRadius: 8,
    paddingVertical: 10,
    marginBottom: 16,
    marginTop: 8,
  },
  addIngredientButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});
