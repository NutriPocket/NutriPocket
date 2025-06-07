import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { homeStyles } from "../../../styles/homeStyles";
import { selectedPlanIdAtom } from "../../../atoms/mealPlanAtom";
import useAxiosInstance from "@/hooks/useAxios";
import { ItineraryPlan, MealType } from "../../../types/mealTypes";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const [auth] = useAtom(authenticatedAtom);
  const [selectedPlanId] = useAtom(selectedPlanIdAtom);
  const axiosInstance = useAxiosInstance("food");
  const [itinerary, setItinerary] = useState<ItineraryPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const days = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  const today = days[new Date().getDay()];
  const todaysFood = itinerary?.weekly_plan?.[today] || null;
  const router = useRouter();

  const handleAddFoodConsumed = (meal: MealType | null, moment: string) => {
    if (meal?.id) {
      router.push({
        pathname: "/home/addFoodConsumed",
        params: {
          moment: moment,
          day: today,
          mealId: meal.id,
        },
      });
    } else {
      router.push({
        pathname: "/mealplan/AllMeals",
        params: {
          moment: moment,
          day: today,
        },
      });
    }
  };

  const handleAddOutOfPlanFoodConsumed = () => {
    router.push({
      pathname: "/mealplan/AllMeals",
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchPlan = async () => {
        if (!selectedPlanId) return;
        try {
          const response = await axiosInstance.get(`/plans/${selectedPlanId}`);
          setItinerary(response.data.data);
        } catch (err) {
          setError("No se pudo cargar el plan de comidas.");
        }
      };
      fetchPlan();
    }, [selectedPlanId])
  );
  return (
    <View style={homeStyles.screenContainer}>
      <View>
        <Text style={homeStyles.welcome}>
          ¡Bienvenido/a, {auth?.username || "usuario"}!
        </Text>
        <Text style={homeStyles.info}>Aquí verás tu resumen y novedades.</Text>
      </View>
      <View style={styles.mealContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Comidas de hoy</Text>
          {error ? (
            <Text style={{ color: "red" }}>{error}</Text>
          ) : todaysFood ? (
            Object.entries(todaysFood).map(([moment, meal]) => (
              <View key={moment} style={styles.momentRow}>
                <View>
                  <Text style={styles.momentLabel}>{moment}</Text>
                  {meal ? (
                    <View style={{ padding: 0 }}>
                      <Text style={styles.mealName}>{meal.name}</Text>
                      <Text style={styles.mealDesc} numberOfLines={1}>
                        {meal.description}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.mealDesc}>No hay comida asignada</Text>
                  )}
                </View>
                <View>
                  <MaterialCommunityIcons
                    name="silverware-fork"
                    size={24}
                    color="#287D76"
                    style={{ marginLeft: 8 }}
                    onPress={() => {
                      handleAddFoodConsumed(meal, moment);
                    }}
                  />
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noMeal}>No hay comidas para hoy.</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    borderLeftWidth: 6,
    alignContent: "center",
    justifyContent: "center",
    padding: 5,
    borderLeftColor: "#287D76",
    gap: 10,
    minWidth: 300,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#287D76",
    textAlign: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  momentRow: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    justifyContent: "space-between",
  },
  momentLabel: {
    fontWeight: "bold",
    color: "#287D76",
  },
  mealName: {
    fontWeight: "bold",
    color: "#333",
    fontSize: 14,
  },
  mealDesc: {
    color: "#555",
    fontSize: 12,
  },
  noMeal: {
    paddingVertical: 10,
    paddingHorizontal: 70,
    color: "#555",
    fontSize: 12,
  },
  info: {
    fontSize: 12,
    color: "#287D76",
  },
  addIngredientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#287D76",
    borderRadius: 8,
    paddingVertical: 12,
  },
  addIngredientButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  mealContainer: {
    gap: 20,
    padding: 40,
  },
});
