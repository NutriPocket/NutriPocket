import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import useAxiosInstance from "@/hooks/useAxios";
import { MealType } from "../../../types/mealTypes";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { MealPlanType } from "../../../types/mealTypes";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function PlanView() {
  const [meals, setMeals] = useState<MealType[] | null>(null);
  const [userPlanInfo, setUserPlanInfo] = useState<MealPlanType | null>(null);
  const [auth] = useAtom(authenticatedAtom);
  const axiosInstance = useAxiosInstance("food");
  const [error, setError] = useState<string | null>(null);

  const fetchFoods = async () => {
    const userId = auth?.id;
    try {
      if (!userId) {
        return;
      }
      if (!auth?.token) {
        return;
      }

      const response = await axiosInstance.get(`/food/user/${userId}/foods`);
      const foods = response.data.foods;
      console.log("foods", foods);
      setMeals(foods);
    } catch (error) {
      console.error("Error fetching plan: ", error);
    }
  };

  const fetchPlan = async () => {
    try {
      const userId = auth?.id;
      if (!userId) {
        return;
      }

      if (!auth?.token) {
        return;
      }

      const response = await axiosInstance.get(`/food/userPlan/${userId}`);
      const data = response.data;
      setUserPlanInfo(data);
      console.log("Plans: ", data);
    } catch (err) {
      setError("No se pudieron obtener los datos del usuario.");
    }
  };

  const handleDeleteFood = async (foodId: string) => {
    try {
      const userId = auth?.id;
      if (!userId) {
        return;
      }

      if (!auth?.token) {
        return;
      }

      await axiosInstance.delete(`/food/user/${userId}/foods/${foodId}`);

      setMeals((prevMeals) =>
        prevMeals ? prevMeals.filter((food) => food.id !== foodId) : null
      );
      console.log("Comida eliminada con éxito");
    } catch (error) {
      console.error("Error deleting food: ", error);
      setError("No se pudo eliminar la comida.");
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      await fetchPlan();
      await fetchFoods();
    };
    fetchAll();
  }, [auth?.id]);

  if (!meals) return <Text>Cargando...</Text>;

  // Mock de comidas por día y momento
  const WEEK_DAYS = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  const MEAL_MOMENTS = ["Desayuno", "Almuerzo", "Merienda", "Cena"];
  // const MOCK_WEEK = WEEK_DAYS.map((day, idx) => ({
  //   day,
  //   meals: MEAL_MOMENTS.map((moment, mIdx) => ({
  //     moment,
  //     meal: {
  //       id: `${idx}-${mIdx}`,
  //       meal_name: `Comida ${moment} ${day}`,
  //       meal_description: `Descripción de ${moment} para adad ${day}`,
  //     },
  //   })),
  // }));

  const MOCK_WEEK: {
    day: string;
    meals: {
      moment: string;
      meal: {
        id: string;
        meal_name: string;
        meal_description: string;
      } | null;
    }[];
  }[] = WEEK_DAYS.map((day, idx) => ({
    day,
    meals: MEAL_MOMENTS.map((moment, mIdx) => ({
      moment,
      meal: null,
    })),
  }));

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>Mi Plan Semanal</Text>
      <Text style={styles.info}>Desliza para ver cada día</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContainer}
      >
        {MOCK_WEEK.map(({ day, meals }) => (
          <View key={day} style={styles.planCard}>
            <Text style={styles.dayTitle}>{day}</Text>
            <View>
              {meals.map((moment) => {
                const meal = moment.meal;

                return (
                  <View
                    key={moment.moment}
                    style={[styles.momentCard, !meal && styles.addFoodCard]}
                  >
                    <View style={{ flex: 1, justifyContent: "space-around" }}>
                      <Text
                        style={{
                          fontWeight: "bold",
                          fontSize: 15,
                          color: "#287D76",
                        }}
                      >
                        {moment.moment}
                      </Text>
                      {meal ? (
                        <>
                          <Text numberOfLines={1} style={{ fontSize: 14 }}>
                            {meal.meal_name}
                          </Text>

                          <Text
                            numberOfLines={1}
                            style={{ fontSize: 12, color: "#888" }}
                          >
                            {meal.meal_description}
                          </Text>
                        </>
                      ) : (
                        <Text>No hay comida asignada</Text>
                      )}
                    </View>
                    {meal ? (
                      <View style={{ justifyContent: "center", padding: 10 }}>
                        <MaterialCommunityIcons
                          name="trash-can-outline"
                          size={24}
                          color="#287D76"
                          onPress={() => {
                            if (meal) {
                              handleDeleteFood(meal.id);
                            }
                          }}
                        />
                      </View>
                    ) : (
                      <View style={{ justifyContent: "center", padding: 10 }}>
                        <MaterialCommunityIcons
                          name="plus"
                          size={28}
                          color="#287D76"
                          onPress={() => {
                            // Aquí pon tu lógica para agregar una comida
                            // Por ejemplo: openAddFoodModal(moment.moment, day)
                          }}
                        />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
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
