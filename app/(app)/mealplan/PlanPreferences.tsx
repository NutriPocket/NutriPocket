import React, { useState, useEffect } from "react";

import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Button } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import useAxiosInstance from "@/hooks/useAxios";
import Header from "../../../components/Header";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { useAtom } from "jotai";
import { selectedPlanIdAtom } from "../../../atoms/mealPlanAtom";
import { MealType } from "../../../types/mealTypes";

const INTERESES = [
  "Vegetariano",
  "Sin gluten",
  "Alto en proteínas",
  "Bajo en carbohidratos",
  // ...otros intereses
];

export default function PlanPreferences() {
  const [selected, setSelected] = useState<number[]>([]);
  const axiosInstance = useAxiosInstance("food");
  const [auth] = useAtom(authenticatedAtom);
  const { title, objective, description } = useLocalSearchParams();
  const [selectedPlanId, setSelectedPlanId] = useAtom(selectedPlanIdAtom);
  const [foodList, setFoodList] = useState<MealType[]>([]);

  const toggleInterest = (interest: number) => {
    setSelected((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const fetchFoods = async () => {
    try {
      const userId = auth?.id;
      if (!userId) {
        return;
      }

      if (!auth?.token) {
        return;
      }

      const response = await axiosInstance.get(`/foods`);
      const foods = response.data.data;
      console.log("foods: ", foods);

      setFoodList(foods);
    } catch (error) {
      console.error("Error fetching foods: ", error);
    }
  };

  const handleCreate = async () => {
    console.log("Creando plan con preferencias:", selected);
    try {
      const response = await axiosInstance.post(
        "/plans",

        {
          fromPreferences: true,
          plan: {
            title: title,
            objetive: objective,
            plan_description: description,
          },
          preferences: {
            user_id: auth?.id,
            preferences: selected,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const planId = response.data.data.id_plan;
      setSelectedPlanId(planId);
      router.back();
      console.log("Plan creado con ID:", planId);
    } catch (error) {
      console.error("Error al crear el plan:", error);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", gap: 20, padding: 10 }}>
      <Header />
      <Text
        style={{
          fontSize: 20,
          textAlign: "center",
          color: "#287D76",
          fontWeight: "bold",
        }}
      >
        Elegí tus intereses
      </Text>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          alignContent: "center",
          gap: 20,
        }}
      >
        {foodList.map((food) => (
          <TouchableOpacity
            key={food.id}
            onPress={() => toggleInterest(food.id)}
            style={{
              padding: 12,
              backgroundColor: selected.includes(food.id) ? "#287D76" : "#eee",
              borderRadius: 8,
            }}
          >
            <Text
              style={{ color: selected.includes(food.id) ? "#fff" : "#333" }}
            >
              {food.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          backgroundColor: "#fff",
        }}
      >
        <Button
          mode="contained"
          onPress={() => handleCreate()}
          style={styles.planButtonCreate}
        >
          Crear Plan
        </Button>
      </View>
    </View>
  );
}

import type { ViewStyle } from "react-native";

const styles: { planButtonCreate: ViewStyle } = {
  planButtonCreate: {
    backgroundColor: "#287D76",
    justifyContent: "center",
    alignItems: "center",
  },
};
