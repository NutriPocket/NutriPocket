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
import { TextInput, ActivityIndicator, IconButton } from "react-native-paper";
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
    router.push({
      pathname: "/(app)",
    });
  };

  const handleSaveAll = async () => {
    //HACER
    try {
      // const updates = Object.entries(editedQuantities).filter(([name, val]) => {
      //   const ing = ingredients.find((i) => i.name === name);
      //   return ing && val !== ing.quantity.toString();
      // });
      // for (const [name, value] of updates) {
      //   await axiosInstance.put(`/foods/${mealId}/ingredients/${name}`, {
      //     quantity: Number(value),
      //   });
      // }
      // setIngredients((prev) =>
      //   prev.map((ing) =>
      //     editedQuantities[ing.name] !== undefined
      //       ? { ...ing, quantity: Number(editedQuantities[ing.name]) }
      //       : ing
      //   )
      // );
      // setEditedQuantities({});
      router.push({
        pathname: "/(app)",
      });
    } catch (error) {
      setError("No se pudo guardar los cambios.");
    }
  };

  return (
    <View style={styles.screenContainer}>
      <Header showBack={false} />
      <View style={{ alignItems: "center" }}>
        <Text style={styles.title}>
          {day} - {moment}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.card}>
            <View style={styles.mealHeader}>
              <View style={{ gap: 8, flex: 1 }}>
                <Text style={styles.mealName}>{selectedFood.name}</Text>
                <Text style={styles.foodDesc}>{selectedFood.description}</Text>
              </View>
              <View
                style={{
                  justifyContent: "center",
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    router.push({
                      pathname: "/home/AllMeals",
                      params: { day, moment },
                    });
                  }}
                  style={{}}
                >
                  <MaterialCommunityIcons
                    name="pencil"
                    size={24}
                    color="#287D76"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* <View style={styles.generalInfoContainer}>
            <View style={styles.card}>
              <Text style={styles.subtitle}>Información General </Text>
            </View>
          </View> */}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ingredientes</Text>
            <View>
              {ingredientsToLoad.map((ing) => {
                let unit = ing.measure_type;
                if (unit === "gram") unit = "g";
                else if (unit === "unit") unit = "u";
                return (
                  <View key={ing.name} style={styles.ingredientRow}>
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
                    <Text style={styles.ingredientName}>{ing.name}</Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
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
          <View style={{ gap: 12, marginTop: 8 }}>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSaveAll}
              accessibilityLabel="Guardar"
            >
              <Text style={styles.actionButtonText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleBackToHome}
              accessibilityLabel="Cancelar"
            >
              <Text style={styles.actionButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    gap: 20,
  },
  scrollViewContent: {
    gap: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    color: "#287D76",
    fontWeight: "bold",
    textAlign: "center",
  },
  mealHeader: {
    flexDirection: "row",
    gap: 20,
  },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
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
    gap: 10,
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
    textAlign: "right",
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
  mealName: {
    fontSize: 18,
    color: "#287D76",
    flex: 1,
    fontWeight: "bold",
  },
  foodDesc: {
    fontSize: 16,
    color: "#555",
  },

  editIcon: {
    color: "#fff",
  },
  actionButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  saveButton: {
    backgroundColor: "#287D76",
  },
  cancelButton: {
    backgroundColor: "#B00020",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
