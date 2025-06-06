import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useAtom } from "jotai";
import useAxiosInstance from "@/hooks/useAxios";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "@/components/Header";
import { TextInput, ActivityIndicator } from "react-native-paper";
import { IngredientType } from "../../../types/mealTypes";
import { removedIngredientsAtom } from "../../../atoms/removedIngredientsAtom";
import { authenticatedAtom } from "../../../atoms/authAtom";

export default function AddFoodConsumed() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const axiosInstance = useAxiosInstance("food");
  const [auth] = useAtom(authenticatedAtom);
  const [removedIngredients, setRemovedIngredients] = useAtom(
    removedIngredientsAtom
  );

  const [error, setError] = useState<string | null>(null);
  const { mealId } = params;
  const [ingredients, setIngredients] = useState<IngredientType[]>([]);
  const [loading, setLoading] = useState(true);
  // Usar un estado separado para los valores editados
  const [editedQuantities, setEditedQuantities] = useState<{
    [name: string]: string;
  }>({});

  const fetchIngredients = async () => {
    try {
      const response = await axiosInstance.get(`/foods/${mealId}/ingredients`);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleRemove = (ingredientName: string) => {
    setRemovedIngredients((prev) => [...prev, ingredientName]);
    setEditedQuantities((prev) => {
      const updated = { ...prev };
      delete updated[ingredientName];
      return updated;
    });
  };
  const handleAddIngredient = () => {
    router.push({
      pathname: "/mealplan/AddIngredientToPlan",
      params: { selectedMealId: mealId },
    });
  };

  const handleIngredientChange = (name: string, value: string) => {
    setEditedQuantities((prev) => ({ ...prev, [name]: value }));
  };

  const handleBackToHome = () => {
    setRemovedIngredients([]);
    setEditedQuantities({});
  };

  const handleSaveAll = async () => {
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
      <Text style={styles.title}>Cargar alimentos consumidos</Text>
      {loading ? (
        <ActivityIndicator />
      ) : ingredients.length > 0 ? (
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <View style={styles.card}>
            <View>
              <Text style={styles.cardTitle}>Ingredientes</Text>
            </View>
            <View>
              {ingredients
                .filter((ing) => !removedIngredients.includes(ing.name))
                .map((ing) => {
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
            <Text style={styles.addIngredientButtonText}>Cargar Comida</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <Text>No se encontró la comida.</Text>
      )}
      {error && <Text style={{ color: "red" }}>{error}</Text>}
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
    padding: 24,
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#287D76",
    borderRadius: 8,
    paddingVertical: 12,

    marginBottom: 4,
  },
  addIngredientButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
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
});
