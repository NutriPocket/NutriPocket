import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import { router } from "expo-router";
import axios from "axios";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../atoms/authAtom";

const validationSchema = Yup.object({
  weightGoal: Yup.number()
    .typeError("El peso objetivo debe ser un número válido")
    .min(10, "El peso debe ser al menos 10 kg")
    .max(300, "El peso no puede superar los 300 kg")
    .required("Por favor, ingresa tu peso objetivo"),
  muscleMassGoal: Yup.number()
    .typeError("La masa muscular objetivo debe ser un número válido")
    .min(0, "El porcentaje de masa muscular debe ser al menos 0%")
    .max(100, "El porcentaje de masa muscular no puede superar el 100%")
    .optional(),
  fatMassGoal: Yup.number()
    .typeError("El porcentaje de grasa objetivo debe ser un número válido")
    .min(0, "El porcentaje de grasa debe ser al menos 0%")
    .max(100, "El porcentaje de grasa no puede superar el 100%")
    .optional(),
    boneMassGoal: Yup.number()
    .typeError("La masa ósea objetivo debe ser un número válido")
    .min(0, "El porcentaje de masa ósea debe ser al menos 0%")
    .max(100, "El porcentaje de masa ósea no puede superar el 100%")
    .optional(),
  targetDate: Yup.string()
    .required("Por favor, ingresa la fecha objetivo")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)")
    .test("is-future-date", "La fecha objetivo debe ser futura", (value) => {
      if (!value) return true; // Skip validation if value is empty
      const today = new Date();
      const targetDate = new Date(value);
      return targetDate > today;
    }
  ),
  
});

const ObjectivesRegister = () => {
  const [auth, setIsAuthenticated] = useAtom(authenticatedAtom);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: any) => {
    const data = {
      weight: parseFloat(values.weightGoal),
      muscle_mass: values.muscleMassGoal ? parseFloat(values.muscleMassGoal) : null,
      fat_mass: values.fatMassGoal ? parseFloat(values.fatMassGoal) : null,
      bone_mass: values.boneMassGoal ? parseFloat(values.boneMassGoal) : null,
      deadline: values.targetDate,
    };
    try {
      const userId = auth?.id;
      const BASE_URL = process.env.PROGRESS_SERVICE_URL || "http://localhost:8081";
      const response = await axios.put(
        `${BASE_URL}/users/${userId}/objectives/`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      if (response.status === 201 || response.status === 200) {
        setIsAuthenticated((prev) => prev ? {
          ...prev,
          objectives: data,
        } : prev);
        router.replace("/home");
      }
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setError("No autorizado");
      } else {
        setError("Ocurrió un error. Intenta nuevamente más tarde.");
      }
    }
  };

  return (
    <Formik
      initialValues={{
        weightGoal: "",
        muscleMassGoal: "",
        fatMassGoal: "",
        boneMassGoal: "",
        targetDate: "",
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <View style={styles.container}>
          <Text style={styles.title}>Cargar Objetivos</Text>
          <TextInput
            label="Fecha objetivo (YYYY-MM-DD)"
            value={values.targetDate}
            onChangeText={handleChange("targetDate")}
            onBlur={handleBlur("targetDate")}
            style={styles.input}
            keyboardType="default"
            theme={{ colors: { background: "white", onSurfaceVariant: touched.targetDate && errors.targetDate ? "red" : "black" } }}
            outlineColor={touched.targetDate && errors.targetDate ? "red" : "gray"}
            activeOutlineColor={touched.targetDate && errors.targetDate ? "red" : "blue"}
            placeholder="YYYY-MM-DD"
          />
          {touched.targetDate && errors.targetDate && (
            <Text style={styles.error}>{errors.targetDate}</Text>
          )}
          <TextInput
            label="Peso objetivo (kg)"
            value={values.weightGoal}
            onChangeText={handleChange("weightGoal")}
            onBlur={handleBlur("weightGoal")}
            style={styles.input}
            keyboardType="numeric"
            theme={{ colors: { background: "white", onSurfaceVariant: touched.weightGoal && errors.weightGoal ? "red" : "black" } }}
            outlineColor={touched.weightGoal && errors.weightGoal ? "red" : "gray"}
            activeOutlineColor={touched.weightGoal && errors.weightGoal ? "red" : "blue"}
          />
          {touched.weightGoal && errors.weightGoal && (
            <Text style={styles.error}>{errors.weightGoal}</Text>
          )}

          <TextInput
            label="Masa muscular objetivo (%) (opcional)"
            value={values.muscleMassGoal}
            onChangeText={handleChange("muscleMassGoal")}
            onBlur={handleBlur("muscleMassGoal")}
            style={styles.input}
            keyboardType="numeric"
            theme={{ colors: { background: "white", onSurfaceVariant: touched.muscleMassGoal && errors.muscleMassGoal ? "red" : "black" } }}
            outlineColor={touched.muscleMassGoal && errors.muscleMassGoal ? "red" : "gray"}
            activeOutlineColor={touched.muscleMassGoal && errors.muscleMassGoal ? "red" : "blue"}
          />
          {touched.muscleMassGoal && errors.muscleMassGoal && (
            <Text style={styles.error}>{errors.muscleMassGoal}</Text>
          )}

          <TextInput
            label="Porcentaje de grasa objetivo (%) (opcional)"
            value={values.fatMassGoal}
            onChangeText={handleChange("fatMassGoal")}
            onBlur={handleBlur("fatMassGoal")}
            style={styles.input}
            keyboardType="numeric"
            theme={{ colors: { background: "white", onSurfaceVariant: touched.fatMassGoal && errors.fatMassGoal ? "red" : "black" } }}
            outlineColor={touched.fatMassGoal && errors.fatMassGoal ? "red" : "gray"}
            activeOutlineColor={touched.fatMassGoal && errors.fatMassGoal ? "red" : "blue"}
          />
          {touched.fatMassGoal && errors.fatMassGoal && (
            <Text style={styles.error}>{errors.fatMassGoal}</Text>
          )}

          <TextInput
            label="Masa ósea objetivo (%) (opcional)"
            value={values.boneMassGoal}
            onChangeText={handleChange("boneMassGoal")}
            onBlur={handleBlur("boneMassGoal")}
            style={styles.input}
            keyboardType="numeric"
            theme={{ colors: { background: "white", onSurfaceVariant: touched.boneMassGoal && errors.boneMassGoal ? "red" : "black" } }}
            outlineColor={touched.boneMassGoal && errors.boneMassGoal ? "red" : "gray"}
            activeOutlineColor={touched.boneMassGoal && errors.boneMassGoal ? "red" : "blue"}

          />
          {touched.boneMassGoal && errors.boneMassGoal && (
            <Text style={styles.error}>{errors.boneMassGoal}</Text>
          )}


          {error && <Text style={styles.error}>{error}</Text>}

          <Button
            mode="contained"
            onPress={handleSubmit as any}
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}> Continuar </Text>
          </Button>
        </View>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#287D76",
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    width: "100%",
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    marginTop: 20,
    width: "100%",
  },
  submitButtonText: {
    color: "black",
    fontSize: 16,
    textAlign: "center",
  },
  error: {
    color: "red",
    textAlign: "left",
    width: "100%",
    marginTop: -10,
    marginBottom: 10,
  },
});

export default ObjectivesRegister;
