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
import { useRouter } from "expo-router";
import useAxiosInstance from "@/hooks/useAxios";
import { FAB } from "react-native-paper";
import { TouchableWithoutFeedback } from "react-native";
import { Formik } from "formik";
import { createFoodValidationSchema } from "../../../utils/validationSchemas";
import { TextInput } from "react-native-paper";

export default function AddFoodToPlan() {
  const [auth] = useAtom(authenticatedAtom);
  const [foodList, setFoodList] = useState<MealType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<MealType | null>(null);
  const axiosInstance = useAxiosInstance("food");
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFood, setNewFood] = useState<MealType | null>(null);

  const fetchFoods = async () => {
    try {
      const userId = auth?.id;
      if (!userId) {
        return;
      }

      if (!auth?.token) {
        return;
      }

      const response = await axiosInstance.get(`/food/user/${userId}/foods`);
      const foods = response.data.foods;

      setFoodList(foods);
    } catch (error) {
      console.error("Error fetching foods: ", error);
    }
  };

  const handleAddFoodToPlan = async (food: MealType) => {
    try {
      const userId = auth?.id;
      if (!userId) {
        return;
      }

      if (!auth?.token) {
        return;
      }

      const response = await axiosInstance.post(
        `/food/user/${userId}/addFood/${food?.id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setSelectedFood(food);
      setSuccess("Comida agregada al plan exitosamente.");
      router.push({
        pathname: "/mealplan/PlanView",
        params: { userId: auth?.id },
      });
    } catch (error) {
      console.error("Error adding food to plan: ", error);
    }
  };

  const handleAddNewFoodToPlan = async (values: any) => {
    try {
      const userId = auth?.id;
      if (!userId) {
        return;
      }

      if (!auth?.token) {
        return;
      }

      const response = await axiosInstance.post(
        `/food/users/${userId}/plan`,
        {
          ...values,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setSuccess("Comida agregada al plan exitosamente.");
      router.push({
        pathname: "/mealplan/PlanView",
        params: { userId: auth?.id },
      });
    } catch (error) {
      setError("No se pudo agregar la comida al plan.");
      setSuccess(null);
      console.error("Error adding new food to plan: ", error);
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
    <View style={styles.screenContainer}>
      <Text style={styles.title}>Agregar Comida al Plan</Text>
      <ScrollView
        contentContainerStyle={{ gap: 20, padding: 20 }}
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
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowAddModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Agregar nueva comida</Text>
                <Formik
                  initialValues={{ name: "", description: "" }}
                  validationSchema={createFoodValidationSchema}
                  onSubmit={handleAddNewFoodToPlan}
                >
                  {({
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    values,
                    touched,
                    errors,
                  }) => (
                    <View style={{ gap: 15, justifyContent: "center" }}>
                      <View>
                        <TextInput
                          label="Nombre de la comida"
                          value={values.name}
                          onChangeText={handleChange("name")}
                          onBlur={handleBlur("name")}
                          mode="outlined"
                          activeOutlineColor="#287D76"
                          dense
                          error={touched.name && !!errors.name}
                          outlineColor={
                            touched.name && errors.name ? "red" : "#287D76"
                          }
                        />

                        {touched.name && errors.name && (
                          <Text style={styles.error}>{errors.name}</Text>
                        )}
                      </View>

                      <View>
                        <TextInput
                          label={"Descripción"}
                          onChangeText={handleChange("description")}
                          onBlur={handleBlur("description")}
                          value={values.description}
                          mode="outlined"
                          activeOutlineColor="#287D76"
                          dense
                          error={touched.description && !!errors.description}
                          outlineColor={
                            touched.description && errors.description
                              ? "red"
                              : "#287D76"
                          }
                        />

                        {touched.description && errors.description && (
                          <Text style={styles.error}>{errors.description}</Text>
                        )}
                      </View>
                      {error && <Text style={styles.error}>{error}</Text>}

                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginTop: 16,
                        }}
                      >
                        <TouchableOpacity
                          style={[
                            styles.modalButton,
                            { backgroundColor: "#287D76" },
                          ]}
                          onPress={() => handleSubmit()}
                        >
                          <Text style={{ color: "#fff" }}>Agregar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.modalButton,
                            { backgroundColor: "#eee" },
                          ]}
                          onPress={() => handleCancel()}
                        >
                          <Text style={{ color: "#287D76" }}>Cancelar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </Formik>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
