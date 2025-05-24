import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { MealType } from "../../../types/mealTypes";
import { useRouter, useLocalSearchParams } from "expo-router";
import useAxiosInstance from "@/hooks/useAxios";
import { FAB } from "react-native-paper";
import { TouchableWithoutFeedback } from "react-native";
import { Formik } from "formik";
import { createFoodValidationSchema } from "../../../utils/validationSchemas";
import { TextInput } from "react-native-paper";
import Header from "../../../components/Header";
import FoodModal from "../../../components/FoodModal";
import { selectedPlanIdAtom } from "../../../atoms/mealPlanAtom";

export default function AddFoodToPlan() {
  const { weekDay, mealMoment } = useLocalSearchParams();

  const [auth] = useAtom(authenticatedAtom);
  const [foodList, setFoodList] = useState<MealType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<MealType | null>(null);
  const axiosInstance = useAxiosInstance("food");
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlanId] = useAtom(selectedPlanIdAtom);
  //const [newFood, setNewFood] = useState<MealType | null>(null);

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

  const handleAddFoodToPlan = async (food: MealType) => {
    try {
      const response = await axiosInstance.put(
        `/plans/${selectedPlanId}/foods`,
        {
          day: weekDay,
          moment: mealMoment,
          food_id: food.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setSelectedFood(food);
      setSuccess("Comida agregada al plan exitosamente.");
      router.back();
    } catch (error) {
      console.error("Error adding food to plan: ", error);
    }
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setError(null);
    setSuccess(null);
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />
      <View style={styles.screenContainer}>
        <Text style={styles.title}>Agregar Comida al Plan</Text>
        <ScrollView
          contentContainerStyle={{
            gap: 20,
            paddingVertical: 50,
            paddingHorizontal: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {foodList.map((food) => (
            <TouchableOpacity
              onPress={() => handleAddFoodToPlan(food)}
              key={food.id}
              style={{
                backgroundColor: "#E8F5E9",
                borderRadius: 14,
                padding: 18,
                shadowColor: "#000",
                shadowOpacity: 0.07,
                shadowRadius: 6,
                borderLeftWidth: 6,
                borderLeftColor: "#287D76",
                borderWidth: selectedFood?.id === food.id ? 2 : 0,
                borderColor:
                  selectedFood?.id === food.id ? "#287D76" : "transparent",
              }}
            >
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: "#287D76" }}
              >
                {food.name}
              </Text>
              <Text style={{ fontSize: 15, color: "#444", marginTop: 4 }}>
                {food.description}
              </Text>
              {/* Puedes agregar más info aquí, como calorías, etc */}
            </TouchableOpacity>
          ))}
          {foodList.length === 0 && (
            <Text style={{ color: "#888", fontSize: 16, textAlign: "center" }}>
              No tienes comidas registradas.
            </Text>
          )}
        </ScrollView>
        <FAB
          icon="plus"
          style={{
            position: "absolute",
            right: 24,
            bottom: 32,
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
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 100,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    color: "#287D76",
    fontWeight: "bold",
    textAlign: "center",
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
    padding: 30,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    padding: 30,
    gap: 30,
  },
  modalTitle: {
    fontWeight: "bold",
    color: "#287D76",
    textAlign: "center",
    fontSize: 22,
  },
  error: {
    color: "red",
    textAlign: "left",
    fontSize: 12,
    fontStyle: "italic",
  },
});
