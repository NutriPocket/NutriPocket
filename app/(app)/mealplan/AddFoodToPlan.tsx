import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { MealType } from "../../../types/mealTypes";
import { useRouter } from "expo-router";
import useAxiosInstance from "@/hooks/useAxios";
import { FAB } from "react-native-paper";

export default function AddFoodToPlan() {
  const [auth] = useAtom(authenticatedAtom);
  const [foodList, setFoodList] = useState<MealType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<MealType | null>(null);
  const axiosInstance = useAxiosInstance("food");
  const router = useRouter();

  const fetchFoods = async () => {
    try {
      const userId = auth?.id;
      if (!userId) {
        return;
      }

      if (!auth?.token) {
        return;
      }

      const response = await axiosInstance.get(`/food/user/${userId}/foods`);
      const foods = response.data.foods;

      setFoodList(foods);
    } catch (error) {
      console.error("Error fetching foods: ", error);
    }
  };

  const handleAddFoodToPlan = async (food: MealType) => {
    try {
      const userId = auth?.id;
      if (!userId) {
        return;
      }

      if (!auth?.token) {
        return;
      }

      const response = await axiosInstance.post(
        `/food/users/${userId}/plan`,
        {
          food_id: food?.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setSelectedFood(food);
      setSuccess("Comida agregada al plan exitosamente.");
      router.push({
        pathname: "/mealplan/PlanView",
        params: { userId: auth?.id },
      });
    } catch (error) {
      console.error("Error adding food to plan: ", error);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>Agregar Comida al Plan</Text>
      <ScrollView
        contentContainerStyle={{ gap: 20, padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {foodList.map((food) => (
          <TouchableOpacity
            onPress={() => handleAddFoodToPlan(food)}
            key={food.id}
            style={{
              backgroundColor: "#E8F5E9",
              borderRadius: 14,
              padding: 18,
              shadowColor: "#000",
              shadowOpacity: 0.07,
              shadowRadius: 6,
              borderLeftWidth: 6,
              borderLeftColor: "#287D76",
              borderWidth: selectedFood?.id === food.id ? 2 : 0,
              borderColor:
                selectedFood?.id === food.id ? "#287D76" : "transparent",
            }}
          >
            <Text
              style={{ fontSize: 20, fontWeight: "bold", color: "#287D76" }}
            >
              {food.name}
            </Text>
            <Text style={{ fontSize: 15, color: "#444", marginTop: 4 }}>
              {food.description}
            </Text>
            {/* Puedes agregar más info aquí, como calorías, etc */}
          </TouchableOpacity>
        ))}
        {foodList.length === 0 && (
          <Text style={{ color: "#888", fontSize: 16, textAlign: "center" }}>
            No tienes comidas registradas.
          </Text>
        )}
      </ScrollView>
      <FAB
        icon="plus"
        style={{
          position: "absolute",
          right: 24,
          bottom: 32,
          backgroundColor: "#287D76",
        }}
        color="#fff"
        onPress={() => {
          // Navega a la pantalla para crear una nueva comida
          //router.push("/mealplan/CreateFood");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 100,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    color: "#287D76",
    fontWeight: "bold",
    textAlign: "center",
  },
});
