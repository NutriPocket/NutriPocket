import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { MealType } from "../../../types/mealTypes";
import { useRouter, useLocalSearchParams } from "expo-router";
import useAxiosInstance from "@/hooks/useAxios";
import { FAB, TouchableRipple } from "react-native-paper";
import Header from "../../../components/Header";
import FoodModal from "../../../components/FoodModal";
import { selectedPlanIdAtom } from "../../../atoms/mealPlanAtom";

export default function AddFoodToPlan() {
  const { weekDay, mealMoment } = useLocalSearchParams();

  const [auth] = useAtom(authenticatedAtom);
  const [foodList, setFoodList] = useState<MealType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const axiosInstance = useAxiosInstance("food");
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);

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

      setFoodList(foods);
    } catch (error) {
      console.error("Error fetching foods: ", error);
    }
  };

  const handleAddFoodToPlan = async (food: MealType) => {
    try {
      const response = await axiosInstance.post(
        `/users/${auth?.id}/plan/foods`,
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
      router.back();
    } catch (error) {
      console.error("Error adding food to plan: ", error);
    }
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setError(null);
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
            <View key={food.id} style={{}}>
              <TouchableRipple
                onPress={() => handleAddFoodToPlan(food)}
                style={[styles.momentCard]}
              >
                <View>
                  <Text style={styles.foodName}>{food.name}</Text>
                  <Text
                    style={{ fontSize: 15, color: "#444", marginTop: 4 }}
                    numberOfLines={1}
                  >
                    {food.description}
                  </Text>
                </View>
              </TouchableRipple>
            </View>
          ))}
          {foodList.length === 0 && (
            <Text style={{ color: "#888", fontSize: 16, textAlign: "center" }}>
              No tienes comidas registradas.
            </Text>
          )}
        </ScrollView>
        <FAB
          icon="plus"
          style={styles.fab}
          color="#fff"
          onPress={() => {
            setShowAddModal(true);
          }}
        />

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
  error: {
    color: "red",
    textAlign: "left",
    fontSize: 12,
    fontStyle: "italic",
  },
  momentCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 10,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 40,
    backgroundColor: "#287D76",
  },
  foodName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#287D76",
  },
});
