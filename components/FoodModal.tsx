import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
} from "react-native";
import { Formik } from "formik";
import { TextInput } from "react-native-paper";
import { createFoodValidationSchema } from "@/utils/validationSchemas";
import { MealType } from "@/types/mealTypes";

interface FoodModalProps {
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  handleAddFoodToPlan: (food: MealType) => Promise<void>;
  handleCancel: () => void;
  error: string | null;
}
const FoodModal: React.FC<FoodModalProps> = ({
  showAddModal,
  setShowAddModal,
  handleAddFoodToPlan,
  handleCancel,
  error,
}) => {
  return (
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
                initialValues={{
                  name: "",
                  description: "",
                  id: 0,
                  calories_per_100g: 0,
                  protein_per_100g: 0,
                  carbohydrates_per_100g: 0,
                }}
                validationSchema={createFoodValidationSchema}
                onSubmit={handleAddFoodToPlan}
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
  );
};

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

export default FoodModal;
