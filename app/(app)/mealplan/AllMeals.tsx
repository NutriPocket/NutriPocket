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

export default function AllMeals() {
  const { moment, day } = useLocalSearchParams();

  const [allFoodList, setAllFoodList] = useState<MealType[]>([]);
  const axiosInstance = useAxiosInstance("food");
  const router = useRouter();

  const fetchAllFoods = async () => {
    try {
      const response = await axiosInstance.get("/foods");
      const foods = response.data.data;
      setAllFoodList(foods);
    } catch (error) {
      console.error("Error fetching all foods: ", error);
    }
  };

  const handleSelectedFood = (food: MealType) => {
    router.push({
      pathname: "/home/addFoodConsumed",
      params: {
        moment: moment,
        day: day,
        mealId: food.id,
      },
    });
  };

  useEffect(() => {
    fetchAllFoods();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />
      <View style={styles.screenContainer}>
        <ScrollView
          contentContainerStyle={{
            gap: 20,
            paddingVertical: 50,
            paddingHorizontal: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Text style={styles.subtitle}> Todas las comidas</Text>
          </View>

          {allFoodList.map((food) => (
            <View key={food.id} style={{}}>
              <TouchableRipple
                onPress={() => {
                  handleSelectedFood(food);
                }}
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
    fontSize: 17,
    fontWeight: "bold",
    color: "#287D76",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    color: "#287D76",
  },
});
