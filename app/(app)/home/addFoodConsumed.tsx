import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import useAxiosInstance from "@/hooks/useAxios";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "@/components/Header";
import { TextInput, ActivityIndicator } from "react-native-paper";
import { IngredientType, MealType } from "../../../types/mealTypes";
import { useAtom } from "jotai";
import { consumedIngredientsAtom } from "../../../atoms/consumedIngredientsAtom";

export default function AddFoodConsumed() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { mealId, moment, day } = params;

  const axiosInstance = useAxiosInstance("food");

  const [ingredientsToLoad, setIngredientsToLoad] = useAtom(
    consumedIngredientsAtom
  );

  const [error, setError] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<IngredientType[]>([]);
  const [selectedFood, setSelectedFood] = useState<MealType>({
    id: 0,
    name: "",
    description: "",
    image_url: "",
    price: 0,
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fiber: 0,
    saturated_fats: 0,
    monounsaturated_fats: 0,
    polyunsaturated_fats: 0,
    trans_fats: 0,
    cholesterol: 0,
  });

  const [loading, setLoading] = useState(true);

  const [editedQuantities, setEditedQuantities] = useState<{
    [name: string]: string;
  }>({});

  const fetchIngredients = async () => {
    try {
      if (!mealId) {
        return;
      }
      const response = await axiosInstance.get(`/foods/${mealId}/ingredients`);

      const apiIngredients = response.data.data;
      console.log("ingredient info:", apiIngredients[0]);
      const parsedIngredients: IngredientType[] = apiIngredients.map(
        (item: any) => ({
          ...item.ingredient,
          quantity: item.quantity,
        })
      );

      setIngredients(parsedIngredients);

      if (ingredientsToLoad.length === 0) {
        setIngredientsToLoad(parsedIngredients);
      }

      console.log("Selected food ingredients: ", ingredientsToLoad);
    } catch (error) {
      console.error("Error fetching food info: ", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodInfo = async () => {
    try {
      if (!mealId) {
        return;
      }
      const response = await axiosInstance.get(`/foods/${mealId}`);
      const data = response.data.data;
      setSelectedFood(data);
    } catch (error) {
      console.error("Error fetching food info: ", error);
    }
  };

  useEffect(() => {
    fetchIngredients();
    fetchFoodInfo();
  }, []);

  const handleRemove = (ingredientName: string) => {
    setIngredientsToLoad((prev) =>
      prev.filter((ing) => ing.name !== ingredientName)
    );

    setEditedQuantities((prev) => {
      const updated = { ...prev };
      delete updated[ingredientName];
      return updated;
    });
  };
  const handleAddIngredient = () => {
    router.push({
      pathname: "/mealplan/AddIngredientToFoodConsume",
      params: { selectedMealId: mealId },
    });
  };

  const handleIngredientChange = (name: string, value: string) => {
    setEditedQuantities((prev) => ({ ...prev, [name]: value }));
    setIngredientsToLoad((prev) =>
      prev.map((ing) =>
        ing.name === name ? { ...ing, quantity: Number(value) } : ing
      )
    );
  };

  const handleBackToHome = () => {
    setIngredientsToLoad([]);
    setEditedQuantities({});
    router.back();
  };

  const handleSaveAll = async () => {
    //HACER
    try {
      const updates = Object.entries(editedQuantities).filter(([name, val]) => {
        const ing = ingredients.find((i) => i.name === name);
        return ing && val !== ing.quantity.toString();
      });
      for (const [name, value] of updates) {
        await axiosInstance.put(`/foods/${mealId}/ingredients/${name}`, {
          quantity: Number(value),
        });
      }
      setIngredients((prev) =>
        prev.map((ing) =>
          editedQuantities[ing.name] !== undefined
            ? { ...ing, quantity: Number(editedQuantities[ing.name]) }
            : ing
        )
      );
      setEditedQuantities({});
    } catch (error) {
      setError("No se pudo guardar los cambios.");
    }
  };

  return (
    <View style={styles.screenContainer}>
      <Header onBack={handleBackToHome} />
      <View style={{ alignItems: "center", gap: 40 }}>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.title}>
            {day} - {moment}
          </Text>
          <Text style={styles.subtitleGeneral}>{selectedFood.name}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
          }}
        >
          <View style={styles.generalInfoContainer}>
            <TouchableOpacity
              style={styles.editCircleButton}
              onPress={() => {
                router.push({
                  pathname: "/mealplan/AllMeals",
                  params: { day, moment },
                });
              }}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={24}
                style={styles.editIcon}
              />
            </TouchableOpacity>
            {/* Card de información general */}
            <View style={styles.card}>
              <Text style={styles.subtitle}>Información General </Text>
              <Text style={styles.foodDesc}>{selectedFood.description}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View>
              <Text style={styles.cardTitle}></Text>
              <Text style={styles.cardTitle}>Ingredientes</Text>
            </View>
            <View>
              {ingredientsToLoad.map((ing) => {
                let unit = ing.measure_type;
                if (unit === "gram") unit = "g";
                else if (unit === "unit") unit = "u";
                return (
                  <View key={ing.name} style={styles.ingredientRow}>
                    <Text style={styles.ingredientName}>{ing.name}</Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <TextInput
                          value={
                            editedQuantities[ing.name] !== undefined
                              ? editedQuantities[ing.name]
                              : ing.quantity.toString()
                          }
                          onChangeText={(text) =>
                            handleIngredientChange(ing.name, text)
                          }
                          style={styles.editInput}
                          keyboardType="numeric"
                          mode="outlined"
                          dense
                        />
                        <Text
                          style={{
                            color: "#287D76",
                            fontWeight: "600",
                          }}
                        >
                          {unit}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemove(ing.name)}
                        style={{}}
                      >
                        <MaterialCommunityIcons
                          name="trash-can-outline"
                          size={22}
                          color="#d32f2f"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.addIngredientButton}
              onPress={handleAddIngredient}
              accessibilityLabel="Agregar nuevo ingrediente"
            >
              <MaterialCommunityIcons name="plus" size={22} color="#fff" />
              <Text style={styles.addIngredientButtonText}>
                Agregar ingrediente
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.addIngredientButton}
            onPress={handleAddIngredient}
            accessibilityLabel="Cargar Comida"
          >
            <Text style={styles.addIngredientButtonText}>Guardar</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#fff",
    gap: 40,
  },
  title: {
    fontSize: 24,
    color: "#287D76",
    fontWeight: "bold",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    padding: 24, // Unificado para ambas cards
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: 24,
    elevation: 2,
    gap: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#287D76",
    marginBottom: 0,
  },
  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  ingredientName: {
    fontSize: 16,
    color: "#287D76",
    fontWeight: "600",
    flex: 1,
  },
  ingredientQty: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
    marginLeft: 8,
  },
  addIngredientButton: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#287D76",
    borderRadius: 8,
    paddingVertical: 12,
  },
  addIngredientButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  modifyFoodButton: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    paddingHorizontal: 8,
  },
  editInput: {
    width: 60,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#b2dfdb",
    paddingHorizontal: 6,
    fontSize: 16,
    height: 36,
  },
  generalInfoContainer: {
    gap: 16,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#287D76",
    alignSelf: "center",
    textAlign: "center",
  },
  subtitleGeneral: {
    fontSize: 20,
    marginTop: 5,
    color: "#287D76",
    textAlign: "center",
  },
  foodDesc: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  editCircleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#287D76",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    alignSelf: "center",
  },
  editIcon: {
    color: "#fff",
  },
});
