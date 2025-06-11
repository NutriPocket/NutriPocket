import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SearchableDropdown } from "../../../components/SearchableDropdown";
import useAxiosInstance from "@/hooks/useAxios";

const MILISECONDS_TO_DEBOUNCE = 200;

export default function AddIngredientToPlan() {
  const router = useRouter();
  const { selectedMealId } = useLocalSearchParams();
  const [error, setError] = useState<string | null>(null);
  const axiosInstance = useAxiosInstance("food");
  const [ingredientOptions, setIngredientOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const [quantity, setQuantity] = useState<string>("");
  const [unit, setUnit] = useState<string>("");

  // Busqueda y selección de ingredientes
  const [selectedIngredient, setSelectedIngredient] = useState<string>("");

  const [tempIngredientSearch, setTempIngredientSearch] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");

  const handleAdd = async () => {
    if (!quantity || !selectedIngredient) {
      setError("Debes ingresar una cantidad y un ingrediente válido.");
      return;
    }
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
      console.log("Fetching ingredients with search: ", ingredientSearch);
      var route: string;
      var response: any;
      var data: any;
      if (ingredientSearch) {
        route = `/foods/ingredients/${encodeURIComponent(ingredientSearch)}`;
        response = await axiosInstance.get(route);
        data = response.data;
        setUnit(data[0].measure_type ? data[0].measure_type : "");
        console.log("measure_type: ", data[0].measure_type);
      }

      console.log("Fetched ingredients: ", data);
      const options = data
        ? data.map((item: any) => ({
            label: String(item.id),
            value: item.name,
          }))
        : [];

      setIngredientOptions(options);
    } catch (error) {
      console.log("Error fetching food info: ", error);
    }
  };

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
    fetchIngredients();
  }, [ingredientSearch]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar Ingrediente</Text>

      <SearchableDropdown
        data={ingredientOptions}
        onSelect={(item) => setSelectedIngredient(item.label)}
        onChangeText={(text) => {
          setTempIngredientSearch(text);
          if (text === "") setSelectedIngredient("");
        }}
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
      {unit && (
        <Text style={{ color: "#287D76", marginBottom: 8 }}>
          Unidad sugerida: {unit || "N/A"}
        </Text>
      )}

      {error && <Text style={{ color: "#B00020", marginTop: 8 }}>{error}</Text>}
      <Button
        mode="contained"
        style={{ backgroundColor: "#287D76", borderRadius: 8, marginTop: 24 }}
        onPress={handleAdd}
      >
        Guardar
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
