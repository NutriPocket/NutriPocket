import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import useAxiosInstance from "@/hooks/useAxios";
import { ItineraryPlan, MealType } from "../../../types/mealTypes";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import Header from "../../../components/common/Header";
import { selectedPlanIdAtom } from "../../../atoms/mealPlanAtom";
import { TouchableRipple } from "react-native-paper";

export default function PlanView() {
  const [itinerary, setItinerary] = useState<ItineraryPlan | null>(null);
  const [auth] = useAtom(authenticatedAtom);
  const axiosInstance = useAxiosInstance("food");
  const [error, setError] = useState<string | null>(null);
  const [selectedPlanId] = useAtom(selectedPlanIdAtom);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealType | null>(null);

  const fetchPlanItinerary = async () => {
    try {
      const userId = auth?.id;
      if (!userId) {
        return;
      }

      if (!auth?.token) {
        return;
      }

      const response = await axiosInstance.get(`/food/plans/${selectedPlanId}`);
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
      params: { selectedPlanId, weekDay, mealMoment },
    });
  };

  const handleSelectFood = async () => {
    try {
      const response = await axiosInstance.get(`/food/food/${selectedPlanId}`);
      const data = response.data;
      setSelectedMeal(data);
      console.log("Selected meal: ", data);
    } catch (error) {
      console.error("Error selecting food: ", error);
      setError("No se pudo seleccionar la comida.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPlanItinerary();
    }, [auth?.id, selectedPlanId])
  );
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header backTo="/mealplan/MealPlanScreen" />
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
                    <TouchableRipple
                      key={moment}
                      style={[styles.momentCard, !meals && styles.addFoodCard]}
                      onPress={() => {
                        if (meals) {
                          setSelectedMeal(meals);
                          setShowAddModal(true);
                          handleSelectFood();
                        }
                      }}
                      disabled={!meals}
                    >
                      <View style={{ flex: 1, flexDirection: "row" }}>
                        <View
                          style={{ flex: 1, justifyContent: "space-around" }}
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
                              onPress={(e) => {
                                e.stopPropagation(); // <-- Esto evita que se dispare el onPress del contenedor
                                handleDeleteFood(meals.id, weekDay, moment);
                              }}
                            />
                          ) : (
                            <MaterialCommunityIcons
                              name="plus"
                              size={28}
                              color="#287D76"
                              onPress={() => handleAddFood("", weekDay, moment)}
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
        {/* MODAL que sube desde abajo */}
        <Modal
          visible={showAddModal}
          animationType="fade"
          transparent
          onRequestClose={() => setShowAddModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowAddModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Información nutricional</Text>
                  {selectedMeal ? (
                    <View>
                      <Text>Calorías: {selectedMeal.calories_per_100g}</Text>
                      <Text>Proteínas: {selectedMeal.protein_per_100g}g</Text>
                      <Text>
                        Carbohidratos: {selectedMeal.carbohydrates_per_100g}g
                      </Text>
                    </View>
                  ) : (
                    //<Text>Cargando información...</Text>
                    <View>
                      <Text>Calorías: </Text>
                      <Text>Proteínas: </Text>
                      <Text>Carbohidratos:</Text>
                      {/* Agregá más campos según tu API */}
                    </View>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
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
  modalButton: {
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
    padding: 10,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.2)", // Le da un fondo más oscuro
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    padding: 30,
    justifyContent: "center",
    gap: 30,
  },
  modalTitle: {
    fontWeight: "bold",
    color: "#287D76",
    textAlign: "center",
    fontSize: 22,
  },
});
