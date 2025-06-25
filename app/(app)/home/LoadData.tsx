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
import useAxiosInstance from "@/hooks/useAxios";
import {
  ItineraryPlan,
  MealType,
  MealPlanDay,
  MealConsumed,
} from "../../../types/mealTypes";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Header from "../../../components/Header";
import WaterConsumptionModal from "@/components/WaterConsumptionModal";
import PhysicalActivityModal from "@/components/PhysicalActivityModal";
import { Button, Icon } from "react-native-paper";

interface Props {
  foodsConsumed: MealConsumed[];
  itinerary: ItineraryPlan | null;
}

export const LoadDataTab: React.FC<Props> = ({ foodsConsumed, itinerary }) => {
  const [auth] = useAtom(authenticatedAtom);
  const foodAxiosInstance = useAxiosInstance("food");
  const progressAxiosInstance = useAxiosInstance("progress");

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

  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const [showWaterModal, setShowWaterModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const structuredMeals = (
    todayEatenMeals: MealConsumed[],
    itinerary: ItineraryPlan | null
  ) => {
    const structuredMeals: MealPlanDay = {};
    todayEatenMeals.forEach((meal) => {
      if (itinerary?.weekly_plan[today]?.[meal.moment]?.name === meal.name) {
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

  const handleAddFoodConsumed = (
    meal: MealType | null | undefined,
    moment: string
  ) => {
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

  return (
    <View style={{ backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={homeStyles.screenContainer}>
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
                const plannedMeal = itinerary?.weekly_plan?.[today][moment]
                  ? itinerary.weekly_plan[today][moment]
                  : null;

                const consumedMeal =
                  structuredMeals(foodsConsumed, itinerary)[moment] || null;

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
                              color="#287D76"
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

        <View
          style={{
            flexDirection: "row",
            gap: 16,
            justifyContent: "space-between",
          }}
        >
          {/* <Button
            mode="contained"
            onPress={() => setShowWaterModal(true)}
            icon={"cup"}
            style={{
              flex: 1,
              backgroundColor: "#287D76",
            }}
          >
            Registrar consumo de agua
          </Button>
          <Button
            mode="contained"
            onPress={() => setShowActivityModal(true)}
            icon={"run"}
            style={{
              flex: 1,
              backgroundColor: "#287D76",
            }}
          >
            Registrar actividad física
          </Button> */}
          <TouchableOpacity
            onPress={() => setShowWaterModal(true)}
            style={styles.registerButton}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingHorizontal: 16,
              }}
            >
              <Icon source="cup" size={24} color="#fff" />
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Registrar consumo de agua
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowActivityModal(true)}
            style={styles.registerButton}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingHorizontal: 16,
              }}
            >
              <Icon source="run" size={24} color="#fff" />
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Registrar actividad física
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <WaterConsumptionModal
        visible={showWaterModal}
        onClose={() => setShowWaterModal(false)}
        userId={auth?.id}
        axiosInstance={foodAxiosInstance}
      />

      <PhysicalActivityModal
        visible={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        userId={auth?.id}
        axiosInstance={progressAxiosInstance}
      />
    </View>
  );
};

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
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  registerButton: {
    flex: 1,
    backgroundColor: "#287D76",
    borderRadius: 24,
    padding: 10,
    alignItems: "center",
  },
});
