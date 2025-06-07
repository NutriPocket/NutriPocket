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

  useFocusEffect(
    React.useCallback(() => {
      const fetchPlan = async () => {
        try {
          const planResponse = await axiosInstance.get(
            `/users/${auth?.id}/plan`
          );
          if (!planResponse.data.data) {
            setError(null);
            setItinerary(null);
            return;
          }
          const response = await axiosInstance.get(
            `/plans/${planResponse.data.data.id_plan}`
          );
          setItinerary(response.data.data);
          setError(null);
        } catch (err: any) {
          if (err?.response?.status === 404) {
            // No mostrar error en consola, es esperado
            setError("No tienes un plan de comidas asignado.");
            setItinerary(null);
          } else {
            // Solo mostrar en consola si es un error real
            console.error(err);
            setError("No se pudo cargar el plan de comidas.");
            setItinerary(null);
          }
        }
      };
      fetchPlan();
    }, [auth?.id])
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
          {error === "No tienes un plan de comidas asignado." ? (
            <Text
              style={{
                color: "#287D76",
                textAlign: "center",
                marginVertical: 10,
              }}
            >
              {error}
            </Text>
          ) : error ? (
            <Text style={{ color: "red" }}>{error}</Text>
          ) : todaysFood ? (
            Object.entries(todaysFood).map(([moment, meal]) => (
              <View key={moment} style={styles.momentRow}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 40 }}>
                    <Text style={styles.momentLabel}>{moment}</Text>
                    {meal ? (
                      <View style={{ padding: 5 }}>
                        <Text style={styles.mealName}>{meal.name}</Text>
                        <Text style={styles.mealDesc} numberOfLines={1}>
                          {meal.description}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.mealDesc}>
                        No hay comida asignada
                      </Text>
                    )}
                  </View>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons
                      name={
                        meal && (meal as any).modified
                          ? "pencil"
                          : "silverware-fork"
                      }
                      size={24}
                      color="#287D76"
                      onPress={() => {
                        handleAddFoodConsumed(meal, moment);
                      }}
                    />
                  </View>
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
    minWidth: 350,
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
    position: "relative",
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
  iconContainer: {
    position: "absolute",
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: "100%",
  },
});
