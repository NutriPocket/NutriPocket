import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { MealType } from "../../../types/mealTypes";
import { useRouter, useLocalSearchParams } from "expo-router";
import useAxiosInstance from "@/hooks/useAxios";
import { FAB, TouchableRipple, Searchbar } from "react-native-paper";
import Header from "../../../components/Header";
import FoodModal from "../../../components/FoodModal";

export default function AllMeals() {
  const { moment, day } = useLocalSearchParams();

  const [allFoodList, setAllFoodList] = useState<MealType[]>([]);
  const [search, setSearch] = useState("");
  const [tempSearch, setTempSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const axiosInstance = useAxiosInstance("food");
  const router = useRouter();

  // Debounce para la searchbar
  useEffect(() => {
    const handler = setTimeout(() => {
      if (tempSearch !== search) {
        setSearch(tempSearch);
      }
    }, 600);
    return () => clearTimeout(handler);
  }, [tempSearch]);

  const fetchAllFoods = async () => {
    setLoading(true);
    try {
      const route = search
        ? `/foods?search_name=${encodeURIComponent(search)}`
        : "/foods";
      const response = await axiosInstance.get(route);
      const foods = response.data.data;
      setAllFoodList(foods);
    } catch (error) {
      console.error("Error fetching all foods: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFoods();
  }, [search]);

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

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />
      <View style={styles.screenContainer}>
        <View style={{ gap: 20 }}>
          <Text style={styles.subtitle}> Todas las comidas</Text>

          <Searchbar
            placeholder="Buscar comida por nombre"
            value={tempSearch}
            onChangeText={setTempSearch}
            onIconPress={() => setSearch(tempSearch)}
            style={{ backgroundColor: "#F5F5F5", marginBottom: 16 }}
            inputStyle={{ fontSize: 16 }}
          />
        </View>

        <ScrollView
          contentContainerStyle={{
            gap: 20,

            paddingHorizontal: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              Cargando...
            </Text>
          ) : (
            allFoodList.map((food) => (
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
            ))
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
