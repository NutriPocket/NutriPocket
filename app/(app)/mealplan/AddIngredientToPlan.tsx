import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CustomDropdown } from "../../../components/CustomDropdown";
import { SearchableDropdown } from "../../../components/SearchableDropdown";
import useAxiosInstance from "@/hooks/useAxios";
import { IngredientType } from "../../../types/mealTypes";

const INGREDIENT_UNITS = [
  { label: "g", value: "gram" },
  { label: "unidad", value: "unit" },
];

const frutas = [
  { label: "1", value: "Manzana" },
  { label: "2", value: "Banana" },
  { label: "3", value: "Naranja" },
  { label: "4", value: "Pera" },
  { label: "5", value: "Uva" },
];

const MILISECONDS_TO_DEBOUNCE = 1000;

export default function AddIngredientToPlan() {
  const router = useRouter();
  const { selectedMealId } = useLocalSearchParams();
  const [error, setError] = useState<string | null>(null);
  const axiosInstance = useAxiosInstance("food");
  const [ingredientOptions, setIngredientOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const [quantity, setQuantity] = useState<string>("");
  const [unit, setUnit] = useState<string>("g");

  // Busqueda y selección de ingredientes
  const [selectedIngredient, setSelectedIngredient] = useState<string>("");
  const [tempIngredientSearch, setTempIngredientSearch] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");

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

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (tempIngredientSearch !== ingredientSearch) {
        setIngredientSearch(tempIngredientSearch);
      }
    }, MILISECONDS_TO_DEBOUNCE);

    return () => clearTimeout(handler);
  }, [tempIngredientSearch]);

  // Fetch ingredients when search changes
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const route = ingredientSearch
          ? `/foods/ingredients/all?search=${ingredientSearch}`
          : `/foods/ingredients/all`;
        const response = await axiosInstance.get(route);
        const data = response.data.data;
        const options = data.map((item: any) => ({
          label: item.name,
          value: item.id,
        }));
        setIngredientOptions(options);
      } catch (error) {
        // Manejo de error
      }
    };
    fetchIngredients();
  }, [ingredientSearch]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar Ingrediente</Text>

      <SearchableDropdown
        data={frutas}
        onSelect={(item) => setSelectedIngredient(item.label)}
        onChangeText={setTempIngredientSearch}
        placeholder="Ingrediente"
      />
      <TextInput
        label="Cantidad"
        value={quantity}
        onChangeText={setQuantity}
        style={{ backgroundColor: "#E0F2F1", borderRadius: 8 }}
        keyboardType="numeric"
        underlineColor="transparent"
        placeholder="Ingrese la cantidad"
        placeholderTextColor="#9E9E9E"
        theme={{ colors: { primary: "#287D76", text: "#287D76" } }}
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
    gap: 16,
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
