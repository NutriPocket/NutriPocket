import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { homeStyles } from "../../../styles/homeStyles";
import { selectedPlanIdAtom } from "../../../atoms/mealPlanAtom";
import useAxiosInstance from "@/hooks/useAxios";
import {
  ItineraryPlan,
  MealType,
  MealPlanDay,
  MealConsumed,
} from "../../../types/mealTypes";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { IndicatorList } from "@/components/IndicatorList";
import Header from "../../../components/Header";

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
  const dayMoments = ["Desayuno", "Almuerzo", "Merienda", "Cena"];
  const today = days[new Date().getDay()];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const todayDate = new Date();
  const todaysFoods = itinerary?.weekly_plan?.[today] || null;
  const router = useRouter();
  const [todayFoodsEaten, setTodayFoodsEaten] = useState<MealConsumed[]>([]);

  // // Momentos del día disponibles

  // // Mock data - comidas que realmente comí hoy
  // const consumedFoodsToday = {
  //   Desayuno: {
  //     name: "Avena con fresas y almendras",
  //     description: "Tazón de avena con fresas frescas, almendras y miel",
  //     isOffPlan: false, // Esta comida estaba en el plan
  //   },

  //   Cena: {
  //     name: "Salmón a la parrilla con verduras asadas",
  //     description:
  //       "Filete de salmón a la parrilla con espárragos y zanahorias asadas",
  //     isOffPlan: true, // Esta comida NO estaba en el plan
  //   },
  // };

  const structuredMeals = (
    todayEatenMeals: MealConsumed[],
    itinerary: ItineraryPlan | null
  ) => {
    const structuredMeals: MealPlanDay = {};
    todayEatenMeals.forEach((meal) => {
      if (itinerary?.weekly_plan[today][meal.moment]?.name === meal.name) {
        structuredMeals[meal.moment] = {
          name: meal.name,
          description: meal.description,
          isOffPlan: false,
        };
      } else {
        structuredMeals[meal.moment] = {
          name: meal.name,
          description: meal.description,
          isOffPlan: true,
        };
      }
    });
    return structuredMeals;
  };

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
        pathname: "/home/AllMeals",
        params: {
          moment: moment,
          day: today,
        },
      });
    }
  };

  const fetchFoodConsumed = async () => {
    try {
      console.log("Fetching consumed foods for today: ", todayDate);
      console.log("User ID: ", auth?.id);
      const response = await axiosInstance.get(
        `/extrafoods/${
          auth?.id
        }/?start_date=${yesterday.toISOString()}&end_date=${todayDate.toISOString()}`
      );

      const data = response.data.data || [];
      console.log("Comidas consumidas hoy: ", data);
      setTodayFoodsEaten(data);
    } catch (error) {
      console.error("Error fetching consumed foods: ", error);
      setError("No se pudieron obtener las comidas consumidas.");
      setTodayFoodsEaten([]);
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
      fetchFoodConsumed();
    }, [auth?.id])
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header showBack={false} />
      <ScrollView contentContainerStyle={homeStyles.screenContainer}>
        <View>
          <Text style={homeStyles.welcome}>
            ¡Bienvenido/a, {auth?.username || "usuario"}!
          </Text>
          <Text style={homeStyles.info}>
            Aquí verás tu resumen y novedades.
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Comidas de hoy</Text>
          {error === "No tienes un plan de comidas asignado." ? (
            <Text
              style={{
                color: "#287D76",
                textAlign: "center",
              }}
            >
              {error}
            </Text>
          ) : error ? (
            <Text style={{ color: "red" }}>{error}</Text>
          ) : (
            <View style={{ gap: 15 }}>
              {dayMoments.map((moment) => {
                const plannedMeal = todaysFoods?.[moment] || null;
                const consumedMeal =
                  structuredMeals(todayFoodsEaten, itinerary)[moment] || null;
                console.log(
                  `structuredMeals para ${moment}:`,
                  structuredMeals(todayFoodsEaten, itinerary)[moment] || null
                );

                return (
                  <View key={moment} style={styles.momentRow}>
                    <View>
                      {consumedMeal ? (
                        // Mostrar lo que realmente comió (prioridad máxima)
                        <View style={styles.consumedMealCard}>
                          <View style={styles.consumedMealInfo}>
                            <View style={styles.momentLabelContainer}>
                              <Text style={styles.momentLabel}>{moment}</Text>
                              {consumedMeal.isOffPlan && (
                                <View style={styles.offPlanBadge}>
                                  <Text style={styles.offPlanBadgeText}>
                                    Fuera del plan
                                  </Text>
                                </View>
                              )}
                            </View>
                            <View>
                              <Text
                                numberOfLines={1}
                                style={styles.consumedMealName}
                              >
                                {consumedMeal.name}
                              </Text>
                              <Text
                                numberOfLines={1}
                                style={styles.consumedMealDesc}
                              >
                                {consumedMeal.description}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.iconContainer}>
                            <MaterialCommunityIcons
                              name={
                                consumedMeal.isOffPlan
                                  ? "alert-circle"
                                  : "check-circle"
                              }
                              size={24}
                              color={
                                consumedMeal.isOffPlan ? "#287D76" : "#287D76"
                              }
                            />
                          </View>
                        </View>
                      ) : (
                        // Mostrar el plan original
                        <View
                          style={{
                            padding: 10,
                            gap: 10,
                            flexDirection: "row",
                            justifyContent: "space-between",
                          }}
                        >
                          <View style={styles.consumedMealInfo}>
                            <Text style={styles.momentLabel}>{moment}</Text>
                            {plannedMeal ? (
                              <View>
                                <Text style={styles.mealName}>
                                  {plannedMeal.name}
                                </Text>
                                <Text style={styles.mealDesc} numberOfLines={1}>
                                  {plannedMeal.description}
                                </Text>
                              </View>
                            ) : (
                              <Text style={styles.noMeal}>
                                No hay comida asignada
                              </Text>
                            )}
                          </View>
                          <View style={styles.iconContainer}>
                            <MaterialCommunityIcons
                              name="silverware-fork-knife"
                              size={24}
                              color={"#287D76"}
                              onPress={() => {
                                handleAddFoodConsumed(plannedMeal, moment);
                              }}
                            />
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <IndicatorList
          title={""}
          indicators={[
            {
              icon: "bullseye-arrow",
              value: "67%",
              label: "Calorías diarias alcanzadas",
              color: "#287D76",
            },
            {
              icon: "fire",
              value: "768",
              label: "Calorías consumidas",
              color: "red",
            },
          ]}
        />
      </ScrollView>
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
    borderLeftColor: "#287D76",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 10,
    gap: 20,
    minWidth: 350,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#287D76",
    textAlign: "center",
  },
  momentRow: {
    paddingHorizontal: 5,
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
    padding: 30,
  },
  iconContainer: {
    padding: 5,
    justifyContent: "center",
  },
  consumedMealCard: {
    flexDirection: "row",
    padding: 10,
    gap: 10,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  consumedMealInfo: {
    flex: 1,
    gap: 5,
  },
  consumedMealName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
  },
  consumedMealDesc: {
    fontSize: 12,
    color: "#555",
  },
  momentLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  offPlanBadge: {
    backgroundColor: "#287D76",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  offPlanBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});
