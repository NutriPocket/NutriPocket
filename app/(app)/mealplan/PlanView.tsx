import React, { useState, useCallback } from "react";

import { View, ScrollView, StyleSheet } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";

import { useAtom } from "jotai";
import useAxiosInstance from "@/hooks/useAxios";
import { ItineraryPlan, MealType } from "../../../types/mealTypes";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import Header from "../../../components/Header";
import { selectedPlanIdAtom } from "../../../atoms/mealPlanAtom";
import { TouchableRipple, SegmentedButtons, FAB } from "react-native-paper";
import FoodModal from "../../../components/FoodModal";
import { Formik } from "formik";
import { Dropdown } from "react-native-paper-dropdown";
import { CustomDropdown } from "../../../components/CustomDropdown";

const WEEK_DAYS = [
  { label: "Domingo", value: "domingo" },
  { label: "Lunes", value: "lunes" },
  { label: "Martes", value: "martes" },
  { label: "Miércoles", value: "miércoles" },
  { label: "Jueves", value: "jueves" },
  { label: "Viernes", value: "viernes" },
  { label: "Sábado", value: "sábado" },
];
const MEAL_MOMENTS = [
  { label: "Desayuno", value: "desayuno" },
  { label: "Almuerzo", value: "almuerzo" },
  { label: "Merienda", value: "merienda" },
  { label: "Cena", value: "cena" },
];

export default function PlanView() {
  const [itinerary, setItinerary] = useState<ItineraryPlan | null>(null);
  const [foodList, setFoodList] = useState<MealType[]>([]);

  const [auth] = useAtom(authenticatedAtom);
  const [selectedPlanId] = useAtom(selectedPlanIdAtom);
  const axiosInstance = useAxiosInstance("food");

  const [tab, setTab] = useState("plan");
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [weekDay, setWeekDay] = useState<string | null>(null);
  const [mealMoment, setMealMoment] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<MealType | null>(null);

  const fetchPlanItinerary = async () => {
    try {
      const userId = auth?.id;
      if (!userId) {
        return;
      }

      if (!auth?.token) {
        return;
      }

      const response = await axiosInstance.get(`/plans/${selectedPlanId}`);
      const data = response.data.data;

      setItinerary(data);
    } catch (err) {
      setError("No se pudieron obtener los datos del usuario.");
    }
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

      const response = await axiosInstance.get(`/users/${userId}/plan/foods`);
      const foods = response.data.data;
      console.log("foods: ", foods);

      setFoodList(foods);
    } catch (error) {
      console.error("Error fetching foods: ", error);
    }
  };
  const handleDeleteFood = async (weekDay: string, mealMoment: string) => {
    try {
      const userId = auth?.id;
      if (!userId) {
        return;
      }
      if (!auth?.token) {
        return;
      }

      await axiosInstance.delete(`/users/${userId}/plan/foods`, {
        data: {
          day: weekDay,
          moment: mealMoment,
        },
      });
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
  const handleModifyFoodFromItinerary = async (
    weekDay: string,
    mealMoment: string
  ) => {
    router.push({
      pathname: "/mealplan/AddFoodToPlan",
      params: { selectedPlanId, weekDay, mealMoment },
    });
  };
  const handleSelectFoodFromItinerary = async (meal: MealType | null) => {
    if (!meal) {
      setError("No se pudo obtener la comida seleccionada.");
      return;
    }
    router.push({
      pathname: "/mealplan/SelectedFood",
      params: { selectedMealId: meal.id },
    });
  };
  const handleCancel = () => {
    setShowAddModal(false);
    setError(null);
  };
  const handleAddFoodToPlan = async (food: MealType) => {
    console.log(food);
    try {
      await axiosInstance.post("/food", { food });
      setShowAddModal(false);

      fetchFoods();
    } catch (error) {
      console.error("Error adding food to plan: ", error);
      setError("No se pudo agregar la comida al plan.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (tab === "all") {
        fetchFoods();
      } else if (tab === "plan") {
        fetchPlanItinerary();
      } else {
      }
    }, [auth?.id, selectedPlanId, tab])
  );
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header backTo="/mealplan/MealPlanScreen" />
      <SegmentedButtons
        value={tab}
        onValueChange={setTab}
        buttons={[
          { value: "plan", label: "Plan Semanal" },
          { value: "all", label: "Comidas" },
        ]}
        style={styles.tab}
        theme={{
          colors: {
            surface: "#E0F2F1", // color de fondo de los botones
            secondaryContainer: "#E0F2F1", // color de fondo de los no seleccionados
          },
        }}
      />
      <View style={styles.screenContainer}>
        {tab == "plan" ? (
          <View>
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
                        <TouchableRipple
                          key={moment}
                          style={[
                            styles.momentCard,
                            !meals && styles.addFoodCard,
                          ]}
                          onPress={() => {
                            if (meals) {
                              handleSelectFoodFromItinerary(meals);
                            }
                          }}
                          disabled={!meals}
                        >
                          <View style={{ flex: 1, flexDirection: "row" }}>
                            <View
                              style={{
                                flex: 1,
                                justifyContent: "space-around",
                              }}
                            >
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
                                <View>
                                  <Text
                                    numberOfLines={1}
                                    style={{ fontSize: 14 }}
                                  >
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
                            <View
                              style={{ justifyContent: "center", padding: 10 }}
                            >
                              {meals ? (
                                <MaterialCommunityIcons
                                  name="trash-can-outline"
                                  size={24}
                                  color="#287D76"
                                  onPress={(e) => {
                                    e.stopPropagation(); // <-- Esto evita que se dispare el onPress del contenedor
                                    handleDeleteFood(weekDay, moment);
                                  }}
                                />
                              ) : (
                                <MaterialCommunityIcons
                                  name="plus"
                                  size={28}
                                  color="#287D76"
                                  onPress={() =>
                                    handleModifyFoodFromItinerary(
                                      weekDay,
                                      moment
                                    )
                                  }
                                />
                              )}
                            </View>
                          </View>
                        </TouchableRipple>
                      ))}
                    </View>
                  </View>
                )
              )}
            </ScrollView>
          </View>
        ) : tab == "all" ? (
          <View style={{ flex: 1 }}>
            <Text style={styles.title}> Todas las Comidas</Text>
            <ScrollView
              contentContainerStyle={{
                gap: 20,
                paddingVertical: 20,
                paddingHorizontal: 20,
              }}
              showsVerticalScrollIndicator={false}
            >
              {foodList.map((food) => (
                <TouchableRipple
                  key={food.id}
                  onPress={() => handleSelectFoodFromItinerary(food)}
                  style={styles.momentCard}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "bold",
                          color: "#287D76",
                        }}
                      >
                        {food.name}
                      </Text>
                      <Text
                        style={{ fontSize: 15, color: "#444", marginTop: 4 }}
                        numberOfLines={1}
                      >
                        {food.description}
                      </Text>
                    </View>
                  </View>
                </TouchableRipple>
              ))}
              {foodList.length === 0 && (
                <Text
                  style={{ color: "#888", fontSize: 16, textAlign: "center" }}
                >
                  No tienes comidas registradas.
                </Text>
              )}
            </ScrollView>
            <FAB
              icon="plus"
              style={{
                position: "absolute",
                right: 24,
                bottom: 1,
                backgroundColor: "#287D76",
              }}
              color="#fff"
              onPress={() => {
                setShowAddModal(true);
              }}
            />
            {/* MODAL que sube desde abajo */}
            <FoodModal
              showAddModal={showAddModal}
              setShowAddModal={setShowAddModal}
              handleAddFoodToPlan={handleAddFoodToPlan}
              handleCancel={handleCancel}
              error={error}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 60,
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
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
