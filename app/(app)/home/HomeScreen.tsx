import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { homeStyles } from "../../../styles/homeStyles";
import useAxiosInstance from "@/hooks/useAxios";
import { ItineraryPlan, MealConsumed } from "../../../types/mealTypes";
import { useFocusEffect } from "@react-navigation/native";
import Header from "../../../components/Header";
import { SegmentedButtons } from "react-native-paper";
import { LoadDataTab } from "./LoadData";
import { DailyResumeTab } from "./DailyResumeTab";
import { string } from "yup";

export default function HomeScreen() {
  const [auth] = useAtom(authenticatedAtom);

  const foodAxiosInstance = useAxiosInstance("food");
  const progressAxiosInstance = useAxiosInstance("progress");

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
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const todayDateString = new Date().toISOString().split("T")[0];
  const todaysFoods = itinerary?.weekly_plan?.[today] || null;

  const [todayFoodsEaten, setTodayFoodsEaten] = useState<MealConsumed[]>([]);

  const [physicalActivity, setPhysicalActivity] = useState<any[]>([]);
  const [burnedCalories, setBurnedCalories] = useState<number>(0);

  const [waterConsumption, setWaterConsumption] = useState<number>(0);

  const [expectedCalories, setExpectedCalories] = useState<number>(0);
  const [consumedCalories, setConsumedCalories] = useState<number>(0);

  const [consumedProteins, setConsumeProteins] = useState<number>(0);
  const [consumedCarbs, setConsumedCarbs] = useState<number>(0);
  const [consumedFibers, setConsumedFibers] = useState<number>(0);
  // const [consumedFat, setConsumedFat] = useState<number>(0);

  const [tab, setTab] = useState<"load" | "daily">("load");

  const getTodayMealIds = () => {
    let result: number[] = [];

    if (todaysFoods && typeof todaysFoods === "object") {
      Object.values(todaysFoods).forEach((meal) => {
        if (meal && typeof meal.id === "number") {
          result.push(meal.id);
        }
      });
    }

    return result;
  };

  const fetchFoodById = async (id: number) => {
    try {
      const response = await foodAxiosInstance.get(`/foods/${id}/nutrition`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching food with ID ${id}:`, error);
      return null;
    }
  };

  const fetchAllFoods = async (ids: number[]) => {
    const foodPromises = ids.map((id) => fetchFoodById(id));
    try {
      const foods = await Promise.all(foodPromises);

      return foods.filter((food) => food !== null);
    } catch (error) {
      console.error("Error fetching all foods:", error);
      return [];
    }
  };

  const fetchConsumedNutrients = async () => {
    var calories = 0;
    var protein = 0;
    var carbs = 0;
    var fiber = 0;

    for (const meal of todayFoodsEaten) {
      try {
        console.log(`Fetching ingredients for meal ID: ${meal.id_extra_food}`);
        const response = await foodAxiosInstance.get(
          `/extraFood/{extraFoodId}/ingredients`,
          { params: { extraFood_id: meal.id_extra_food } }
        );
        const extraFoodIngredient = response.data.data;

        if (!extraFoodIngredient || !Array.isArray(extraFoodIngredient)) return;

        function calculateNutrients(
          ingridients: any[],
          nutrient: "calories" | "protein" | "carbs" | "fiber"
        ): number {
          return ingridients.reduce((sum, ingredient) => {
            if (ingredient.ingredient.measure_type === "gram") {
              return Math.round(
                sum +
                  (ingredient.ingredient[nutrient] / 100) * ingredient.quantity
              );
            } else if (ingredient.ingredient.measure_type === "unit") {
              return Math.round(
                sum + ingredient.ingredient[nutrient] * ingredient.quantity
              );
            } else {
              return sum; // Si el tipo no es ninguno de los anteriores, no suma nada
            }
          }, 0);
        }

        calories = calculateNutrients(extraFoodIngredient, "calories");
        carbs = calculateNutrients(extraFoodIngredient, "carbs");
        fiber = calculateNutrients(extraFoodIngredient, "fiber");
        protein = calculateNutrients(extraFoodIngredient, "protein");
      } catch (error) {
        console.error(
          `Error fetching ingredients for meal ID ${meal.id_extra_food}:`,
          error
        );
      }
    }
    setConsumedCalories(calories);
    setConsumeProteins(protein);
    setConsumedCarbs(carbs);
    setConsumedFibers(fiber);
  };

  const fetchExpectedCalories = async () => {
    const mealIds = getTodayMealIds();
    var calories: number = 0;
    if (mealIds.length === 0) {
      console.log("No hay comidas asignadas para hoy.");
      return 0;
    }
    const foods = await fetchAllFoods(mealIds);
    if (foods.length === 0) {
      console.log("No se encontraron comidas para los IDs proporcionados.");
      return 0;
    }

    console.log("Comidas asignadas para hoy:", foods);

    foods.forEach((food) => {
      calories += food.calories;
    });

    setExpectedCalories(Math.round(calories * 100) / 100);
  };

  const fetchFoodConsumed = async () => {
    try {
      console.log("User ID: ", auth?.id);
      const response = await foodAxiosInstance.get(
        `/extrafoods/${auth?.id}/?start_date=${todayDateString}&end_date=${todayDateString}`
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

  const fetchPhysicalActivity = async () => {
    try {
      const response = await progressAxiosInstance.get(
        `/users/${auth?.id}/exercises/`
      );
      const data = response.data.data;
      console.log("Actividad física de hoy: ", data);

      setPhysicalActivity(data.exercises || []);
      setBurnedCalories(data.totalBurned || 0);
    } catch (error) {
      console.error("Error fetching physical activity: ", error);
      setPhysicalActivity([]);
      setError("No se pudieron obtener los datos de actividad física.");
    }
  };

  const fetchPlan = async () => {
    try {
      const planResponse = await foodAxiosInstance.get(
        `/users/${auth?.id}/plan`
      );
      if (!planResponse.data.data) {
        setError(null);
        setItinerary(null);
        return;
      }
      const response = await foodAxiosInstance.get(
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

  const fetchWaterConsumption = async () => {
    try {
      const todayDate = new Date();
      const dateString = todayDate.toISOString().split("T")[0]; // yyyy-mm-dd
      const response = await foodAxiosInstance.get(
        `/users/${auth?.id}/water_consumption/`
      );
      const consumptions = response.data?.consumptions ?? [];
      const todayTotal = consumptions
        .filter((c: any) => c.consumption_date === dateString)
        .reduce((sum: number, c: any) => sum + (c.amount_ml || 0), 0);
      console.log("Water consumption for today:", todayTotal);
      setWaterConsumption(todayTotal);
    } catch (err) {
      setWaterConsumption(0);
    }
  };

  useEffect(() => {
    fetchExpectedCalories();
  }, [itinerary]);

  useEffect(() => {
    fetchConsumedNutrients();
  }, [todayFoodsEaten]);

  useFocusEffect(
    React.useCallback(() => {
      fetchPlan();
      fetchFoodConsumed();
      fetchWaterConsumption();
      fetchPhysicalActivity();
    }, [auth?.id, tab])
  );

  return (
    <View
      style={{ flex: 1, backgroundColor: "#fff", justifyContent: "center" }}
    >
      <Header showBack={false} />
      <View style={{ gap: 10 }}>
        <View>
          <Text style={homeStyles.welcome}>
            ¡Bienvenido/a, {auth?.username || "usuario"}!
          </Text>
          <Text style={homeStyles.info}>
            {itinerary
              ? "Aquí verás tu resumen y novedades del día."
              : "Elige un plan de comidas para comenzar"}
          </Text>
        </View>
        {itinerary && (
          <View>
            <SegmentedButtons
              value={tab}
              onValueChange={setTab}
              buttons={[
                { value: "load", label: "Carga" },
                { value: "daily", label: "Resumen diario" },
              ]}
              style={styles.tab}
              theme={{
                colors: {
                  surface: "#E0F2F1", // color de fondo de los botones
                  secondaryContainer: "#E0F2F1", // color de fondo de los no seleccionados
                },
              }}
            />
            {tab === "load" ? (
              <LoadDataTab
                foodsConsumed={todayFoodsEaten}
                itinerary={itinerary}
              />
            ) : (
              <DailyResumeTab
                expectedCalories={expectedCalories}
                consumedCalories={consumedCalories}
                waterConsumption={waterConsumption}
                consumedProteins={consumedProteins}
                consumedCarbs={consumedCarbs}
                consumedFibers={consumedFibers}
                physicalActivity={physicalActivity}
                burnedCalories={burnedCalories}
              />
            )}
          </View>
        )}
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
});
