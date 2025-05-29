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
  const [page, setPage] = React.useState(0);

  const initialValues = {
                  name: "",
                  description: "",
    price: 0,
                  id: 0,
                  calories_per_100g: 0,
                  protein_per_100g: 0,
    carbs_per_100g: 0,
    fiber_per_100g: 0,
    saturated_fats_per_100g: 0,
    monounsaturated_fats_per_100g: 0,
    polyunsaturated_fats_per_100g: 0,
    trans_fats_per_100g: 0,
    cholesterol_per_100g: 0,
    ingredients: [] as string[],
    image_url: "",
  };

  const renderPage = (props: any) => {
    const { values, handleChange, handleBlur, touched, errors, setFieldValue } = props;
    const [ingredientInput, setIngredientInput] = React.useState("");
    const ingredients = values.ingredients || [];
    switch (page) {
      case 0:
        return (
          <View style={{ gap: 15 }}>
                      <TextInput
                        label="Nombre de la comida"
                        value={values.name}
                        onChangeText={handleChange("name")}
                        onBlur={handleBlur("name")}
                        mode="outlined"
                        activeOutlineColor="#287D76"
                        dense
                        error={touched.name && !!errors.name}
              outlineColor={touched.name && errors.name ? "red" : "#287D76"}
                      />
                      {touched.name && errors.name && (
                        <Text style={styles.error}>{errors.name}</Text>
                      )}
                      <TextInput
              label="Descripción"
              value={values.description}
                        onChangeText={handleChange("description")}
                        onBlur={handleBlur("description")}
                        mode="outlined"
                        activeOutlineColor="#287D76"
                        dense
                        error={touched.description && !!errors.description}
              outlineColor={touched.description && errors.description ? "red" : "#287D76"}
                      />
                      {touched.description && errors.description && (
                        <Text style={styles.error}>{errors.description}</Text>
                      )}
            <TextInput
              label="Precio"
              value={values.price}
              onChangeText={handleChange("price")}
              onBlur={handleBlur("price")}
              mode="outlined"
              activeOutlineColor="#287D76"
              dense
              keyboardType="numeric"
              error={touched.price && !!errors.price}
              outlineColor={touched.price && errors.price ? "red" : "#287D76"}
            />
            {touched.price && errors.price && (
              <Text style={styles.error}>{errors.price}</Text>
            )}
          </View>
        );
      case 1:
        return (
          <View style={{ gap: 15 }}>
            <Text style={{ fontWeight: "bold", fontSize: 16, color: "#287D76" }}>Ingredientes</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                label="Agregar ingrediente"
                value={ingredientInput}
                onChangeText={setIngredientInput}
                mode="outlined"
                dense
                style={{ flex: 1 }}
                activeOutlineColor="#287D76"
              />
              <TouchableOpacity
                style={{
                  backgroundColor: "#287D76",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => {
                  if (ingredientInput.trim()) {
                    setFieldValue("ingredients", [
                      ...(values.ingredients || []),
                      ingredientInput.trim(),
                    ]);
                    setIngredientInput("");
                  }
                }}
                accessibilityLabel="Agregar ingrediente"
              >
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {(values.ingredients || []).map((ingredient: string, idx: number) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#E0F2F1",
                    borderRadius: 16,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    marginBottom: 4,
                    marginRight: 4,
                  }}
                >
                  <Text style={{ color: "#287D76", marginRight: 6 }}>{ingredient}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setFieldValue(
                        "ingredients",
                        values.ingredients.filter((_: string, i: number) => i !== idx)
                      );
                    }}
                    accessibilityLabel={`Eliminar ${ingredient}`}
                  >
                    <Text style={{ color: "red", fontWeight: "bold" }}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        );
      case 2:
        return (
          <View style={{ gap: 15 }}>
            <TextInput label="Calorías/100g" value={String(values.calories_per_100g)} onChangeText={handleChange("calories_per_100g")} keyboardType="numeric" mode="outlined" dense />
            <TextInput label="Proteína/100g" value={String(values.protein_per_100g)} onChangeText={handleChange("protein_per_100g")} keyboardType="numeric" mode="outlined" dense />
            <TextInput label="Carbohidratos/100g" value={String(values.carbs_per_100g)} onChangeText={handleChange("carbs_per_100g")} keyboardType="numeric" mode="outlined" dense />
            <TextInput label="Fibra/100g" value={String(values.fiber_per_100g)} onChangeText={handleChange("fiber_per_100g")} keyboardType="numeric" mode="outlined" dense />
            <TextInput label="Grasas saturadas/100g" value={String(values.saturated_fats_per_100g)} onChangeText={handleChange("saturated_fats_per_100g")} keyboardType="numeric" mode="outlined" dense />
            <TextInput label="Grasas monoinsaturadas/100g" value={String(values.monounsaturated_fats_per_100g)} onChangeText={handleChange("monounsaturated_fats_per_100g")} keyboardType="numeric" mode="outlined" dense />
            <TextInput label="Grasas poliinsaturadas/100g" value={String(values.polyunsaturated_fats_per_100g)} onChangeText={handleChange("polyunsaturated_fats_per_100g")} keyboardType="numeric" mode="outlined" dense />
            <TextInput label="Grasas trans/100g" value={String(values.trans_fats_per_100g)} onChangeText={handleChange("trans_fats_per_100g")} keyboardType="numeric" mode="outlined" dense />
            <TextInput label="Colesterol/100g" value={String(values.cholesterol_per_100g)} onChangeText={handleChange("cholesterol_per_100g")} keyboardType="numeric" mode="outlined" dense />
                    </View>
        );
      case 3:
        return (
          <View style={{ gap: 15 }}>
            <Text style={{ fontWeight: "bold", fontSize: 16, color: "#287D76" }}>Añade una imagen</Text>
            <TextInput
              label="URL de la imagen"
              value={values.image_url}
              onChangeText={handleChange("image_url")}
              onBlur={handleBlur("image_url")}
              mode="outlined"
              activeOutlineColor="#287D76"
              dense
              error={touched.image_url && !!errors.image_url}
              outlineColor={touched.image_url && errors.image_url ? "red" : "#287D76"}
            />
            {touched.image_url && errors.image_url && (
              <Text style={styles.error}>{errors.image_url}</Text>
            )}
          </View>
        );
      default:
        return null;
    }
  };

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
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={styles.modalTitle}>Agregar nueva comida</Text>
                <TouchableOpacity
                  onPress={() => {
                    setPage(0);
                    setShowAddModal(false);
                    handleCancel();
                  }}
                  style={{ padding: 4, marginLeft: 12 }}
                  accessibilityLabel="Cerrar"
                >
                  <Text style={{ fontSize: 40, color: "#287D76", fontWeight: "bold" }}>×</Text>
                </TouchableOpacity>
              </View>
              <Formik
                initialValues={initialValues}
                validationSchema={createFoodValidationSchema}
                onSubmit={handleAddFoodToPlan}
              >
                {(props) => (
                  <View style={{ gap: 15, justifyContent: "center" }}>
                    {renderPage(props)}
                    {error && <Text style={styles.error}>{error}</Text>}
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
                      {page > 0 && (
                        <TouchableOpacity
                          style={[styles.modalButton, { backgroundColor: "#eee" }]}
                          onPress={() => setPage(page - 1)}
                    >
                          <Text style={{ color: "#287D76" }}>Atrás</Text>
                        </TouchableOpacity>
                      )}
                      {page < 3 ? (
                      <TouchableOpacity
                          style={[styles.modalButton, { backgroundColor: "#287D76" }]}
                          onPress={() => setPage(page + 1)}
                        >
                          <Text style={{ color: "#fff" }}>Siguiente</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[styles.modalButton, { backgroundColor: "#287D76" }]}
                          onPress={() => props.handleSubmit()}
                      >
                        <Text style={{ color: "#fff" }}>Agregar</Text>
                      </TouchableOpacity>
                      )}
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
    padding: 30,
    gap: 30,
    borderWidth: 2.5,
    borderColor: "#287D76",
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android shadow
    elevation: 2,
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
