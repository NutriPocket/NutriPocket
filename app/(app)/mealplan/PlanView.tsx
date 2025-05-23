import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import useAxiosInstance from "@/hooks/useAxios";
import { ItineraryPlan, MealType } from "../../../types/mealTypes";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import Header from "../../../components/common/Header";

export default function PlanView() {
  const { planId } = useLocalSearchParams();

  const [itinerary, setItinerary] = useState<ItineraryPlan | null>(null);
  const [auth] = useAtom(authenticatedAtom);
  const axiosInstance = useAxiosInstance("food");
  const [error, setError] = useState<string | null>(null);

  const fetchPlanItinerary = async () => {
    try {
      const userId = auth?.id;
      if (!userId) {
        return;
      }

      if (!auth?.token) {
        return;
      }

      const response = await axiosInstance.get(`/food/plans/${planId}`);
      const data = response.data;

      console.log("Plan: ", data.weekly_plan);
      setItinerary(data);
    } catch (err) {
      setError("No se pudieron obtener los datos del usuario.");
    }
  };

  const handleDeleteFood = async (
    foodId: string,
    weekDay: string,
    mealMoment: string
  ) => {
    try {
      const userId = auth?.id;
      if (!userId) {
        return;
      }
      if (!auth?.token) {
        return;
      }
      await axiosInstance.delete(
        `/food/userPlan/${userId}/removeFood/${foodId}`
      );
      setItinerary((prevItinerary) => {
        if (!prevItinerary) return null;
        return {
          ...prevItinerary,
          weekly_plan: {
            ...prevItinerary.weekly_plan,
            [weekDay]: {
              ...prevItinerary.weekly_plan[weekDay],
              [mealMoment]: null, // <-- acá seteás en null
            },
          },
        };
      });
      console.log("Comida eliminada con éxito");
    } catch (error) {
      console.error("Error deleting food: ", error);
      setError("No se pudo eliminar la comida.");
    }
  };

  const handleAddFood = async (
    foodId: string,
    weekDay: string,
    mealMoment: string
  ) => {
    router.push({
      pathname: "/mealplan/AddFoodToPlan",
      params: { planId, weekDay, mealMoment },
    });
  };

  useFocusEffect(
    useCallback(() => {
      fetchPlanItinerary();
    }, [auth?.id, planId])
  );
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />
      <View style={styles.screenContainer}>
        <Text style={styles.title}>Mi Plan Semanal</Text>
        <Text style={styles.info}>Desliza para ver cada día</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
        >
          {Object.entries(itinerary?.weekly_plan || {}).map(
            ([weekDay, moments]) => (
              <View key={weekDay} style={styles.planCard}>
                <Text style={styles.dayTitle}>{weekDay}</Text>
                <View>
                  {Object.entries(moments).map(([moment, meals]) => (
                    <View
                      key={moment}
                      style={[styles.momentCard, !meals && styles.addFoodCard]}
                    >
                      <View style={{ flex: 1, justifyContent: "space-around" }}>
                        <Text
                          style={{
                            fontWeight: "bold",
                            fontSize: 15,
                            color: "#287D76",
                          }}
                        >
                          {moment}
                        </Text>
                        {meals ? (
                          <View key={meals.id}>
                            <Text numberOfLines={1} style={{ fontSize: 14 }}>
                              {meals.name}
                            </Text>
                            <Text
                              numberOfLines={1}
                              style={{ fontSize: 12, color: "#888" }}
                            >
                              {meals.description}
                            </Text>
                          </View>
                        ) : (
                          <Text>No hay comida asignada</Text>
                        )}
                      </View>
                      <View style={{ justifyContent: "center", padding: 10 }}>
                        {meals ? (
                          <MaterialCommunityIcons
                            name="trash-can-outline"
                            size={24}
                            color="#287D76"
                            onPress={() => {
                              if (meals)
                                handleDeleteFood(meals.id, weekDay, moment);
                            }}
                          />
                        ) : (
                          <MaterialCommunityIcons
                            name="plus"
                            size={28}
                            color="#287D76"
                            onPress={() => {
                              handleAddFood("", weekDay, moment);
                            }}
                          />
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 100,
  },
  title: {
    fontSize: 24,
    color: "#287D76",
    fontWeight: "bold",
    textAlign: "center",
  },
  info: {
    fontSize: 16,
    color: "#287D76",
    textAlign: "center",
    marginBottom: 40,
  },
  planCard: {
    padding: 16,
    gap: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    width: 340,
    justifyContent: "space-between",
  },
  cardsContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 16,
  },
  dayTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#287D76",
    textAlign: "center",
  },
  momentCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    flexDirection: "row",
  },
  addFoodCard: {
    borderStyle: "dashed",
    borderColor: "#287D76",
    borderWidth: 2,
  },
});
