import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CustomDropdown } from "../../../components/CustomDropdown";
import useAxiosInstance from "@/hooks/useAxios";
import { IngredientType } from "../../../types/mealTypes";

const INGREDIENT_UNITS = [
  { label: "g", value: "gram" },
  { label: "unidad", value: "unit" },
];

export default function AddIngredientToPlan() {
  const router = useRouter();
  const { selectedMealId } = useLocalSearchParams();
  const [error, setError] = useState<string | null>(null);
  const axiosInstance = useAxiosInstance("food");
  const [ingredientOptions, setIngredientOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const [selectedIngredient, setSelectedIngredient] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [unit, setUnit] = useState<string>("g");

  const handleAdd = async () => {
    try {
      const response = await axiosInstance.post(
        `/foods/${selectedMealId}/ingredients/add/${selectedIngredient}`,
        {
          measure: unit,
          quantity: quantity,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Ingredient added successfully: ", response);

      router.back();
    } catch (error) {
      console.error("Error adding ingredient to plan: ", error);
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await axiosInstance.get(`/foods/ingredients/all`);
      const data = response.data.data;

      const options = data.map((item: any) => ({
        label: item.name,
        value: item.id,
      }));

      setIngredientOptions(options);

      console.log("Selected food data:   ", data);
    } catch (error) {
      console.error("Error fetching food info: ", error);
    }
  };
  useEffect(() => {
    fetchIngredients();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar Ingrediente</Text>
      <CustomDropdown
        label="Ingrediente"
        options={ingredientOptions}
        selected={selectedIngredient ? [selectedIngredient] : []}
        onChange={(arr) => setSelectedIngredient(arr[0] ?? null)}
        multiple={false}
      />
      <TextInput
        label="Cantidad"
        value={quantity}
        onChangeText={setQuantity}
        style={{ backgroundColor: "#E0F2F1", borderRadius: 8, marginTop: 16 }}
        keyboardType="numeric"
      />
      <CustomDropdown
        label="Unidad"
        options={INGREDIENT_UNITS}
        selected={[unit]}
        onChange={(arr) => setUnit(arr[0] ?? "gram")}
        multiple={false}
      />
      {error && <Text style={{ color: "#B00020", marginTop: 8 }}>{error}</Text>}
      <Button
        mode="contained"
        style={{ backgroundColor: "#287D76", borderRadius: 8, marginTop: 24 }}
        onPress={handleAdd}
      >
        Agregar al plan
      </Button>
      <Button
        mode="outlined"
        style={{ borderColor: "#287D76", borderRadius: 8, marginTop: 8 }}
        textColor="#287D76"
        onPress={() => router.back()}
      >
        Cancelar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    color: "#287D76",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
});
