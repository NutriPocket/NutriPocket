import { useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import { router } from "expo-router";
import axios from "axios";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../atoms/authAtom";

const validationSchema = Yup.object({
  weight: Yup.number()
    .typeError("El peso debe ser un número válido")
    .min(10, "El peso debe ser al menos 10 kg")
    .max(300, "El peso no puede superar los 300 kg")
    .required("Por favor, ingresa tu peso"),
  muscleMass: Yup.number()
    .typeError("La masa muscular debe ser un número válido")
    .min(0, "La masa muscular no puede ser negativa")
    .max(100, "La masa muscular no puede superar los 100 kg")
    .optional(),
  bodyFatPercentage: Yup.number()
    .typeError("El porcentaje de grasa debe ser un número válido")
    .min(0, "El porcentaje de grasa debe ser al menos 0%")
    .max(100, "El porcentaje de grasa no puede superar el 100%")
    .optional(),
  boneMass: Yup.number()
    .typeError("La masa ósea debe ser un número válido")
    .min(0, "La masa ósea no puede ser negativa")
    .max(100, "La masa ósea no puede superar los 100 kg")
    .optional(),
});

const AnthropometricRegister = () => {
  const [auth, setIsAuthenticated] = useAtom(authenticatedAtom);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: any) => {
    console.log("Form values: ", values);

    const data = {
      user_id: auth?.id,
      weight: parseFloat(values.weight),
      muscle_mass: values.muscleMass ? parseFloat(values.muscleMass) : null,
      fat_mass: values.bodyFatPercentage ? parseFloat(values.bodyFatPercentage) : null,
      bone_mass: values.boneMass ? parseFloat(values.boneMass) : null, 
    };

    try {
      const userId = auth?.id;
      console.log("id del usuario: ", userId);

      const BASE_URL =
        process.env.PROGRESS_SERVICE_URL || "http://localhost:8081";
      const response = await axios.put(
        `${BASE_URL}/users/${userId}/anthropometrics/`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      console.log("Response: ", response.data);

      if (response.status === 201) {
        console.log("Anthropometric data sent: ", response.data);
        setIsAuthenticated((prev) => ({
          ...prev,
          ...values,
        }));
        router.replace("/objectivesRegister");
      }
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setError("Invalid email or password");
      } else {
        setError("An error occurred. Please try again later.");
      }
    }
  };
  return (
    <Formik
      initialValues={{
        weight: "",
        muscleMass: "",
        bodyFatPercentage: "",
        boneMass: "",
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        touched,
      }) => (
        <View style={styles.container}>
          <Text style={styles.title}>Cargar Datos Antropométricos</Text>

          {/* <TextInput
            label="Altura (cm)"
            value={values.height}
            onChangeText={handleChange("height")}
            onBlur={handleBlur("height")}
            style={styles.input}
            keyboardType="numeric"
            theme={{
              colors: {
                background: "white",
                onSurfaceVariant: touched.height && errors.height ? "red" : "black",
              },
            }}
            outlineColor={touched.height && errors.height ? "red" : "gray"}
            activeOutlineColor={touched.height && errors.height ? "red" : "blue"}
          />
          {touched.height && errors.height && (
            <Text style={styles.error}>{errors.height}</Text>
          )} */}

          <TextInput
            label="Peso (kg)"
            value={values.weight}
            onChangeText={handleChange("weight")}
            onBlur={handleBlur("weight")}
            style={styles.input}
            keyboardType="numeric"
            theme={{
              colors: {
                background: "white",
                onSurfaceVariant: touched.weight && errors.weight ? "red" : "black",
              },
            }}
            outlineColor={touched.weight && errors.weight ? "red" : "gray"}
            activeOutlineColor={touched.weight && errors.weight ? "red" : "blue"}
          />
          {touched.weight && errors.weight && (
            <Text style={styles.error}>{errors.weight}</Text>
          )}

          <TextInput
            label="Masa Muscular (kg) (opcional) "
            value={values.muscleMass}
            onChangeText={handleChange("muscleMass")}
            onBlur={handleBlur("muscleMass")}
            style={styles.input}
            keyboardType="numeric"
            theme={{
              colors: {
                background: "white",
                onSurfaceVariant:
                  touched.muscleMass && errors.muscleMass ? "red" : "black",
              },
            }}
            outlineColor={touched.muscleMass && errors.muscleMass ? "red" : "gray"}
            activeOutlineColor={
              touched.muscleMass && errors.muscleMass ? "red" : "blue"
            }
          />
          {touched.muscleMass && errors.muscleMass && (
            <Text style={styles.error}>{errors.muscleMass}</Text>
          )}

          <TextInput
            label="Porcentaje de Grasa Corporal(%) (opcional)"
            value={values.bodyFatPercentage}
            onChangeText={handleChange("bodyFatPercentage")}
            onBlur={handleBlur("bodyFatPercentage")}
            style={styles.input}
            keyboardType="numeric"
            theme={{
              colors: {
                background: "white",
                onSurfaceVariant:
                  touched.bodyFatPercentage && errors.bodyFatPercentage
                    ? "red"
                    : "black",
              },
            }}
            outlineColor={
              touched.bodyFatPercentage && errors.bodyFatPercentage ? "red" : "gray"
            }
            activeOutlineColor={
              touched.bodyFatPercentage && errors.bodyFatPercentage ? "red" : "blue"
            }
          />
          {touched.bodyFatPercentage && errors.bodyFatPercentage && (
            <Text style={styles.error}>{errors.bodyFatPercentage}</Text>
          )}

          <TextInput
            label="Masa ósea (kg) (opcional)"
            value={values.boneMass}
            onChangeText={handleChange("boneMass")}
            onBlur={handleBlur("boneMass")}
            style={styles.input}
            keyboardType="numeric"
            theme={{
              colors: {
                background: "white",
                onSurfaceVariant: touched.boneMass && errors.boneMass ? "red" : "black",
              },
            }}
            outlineColor={touched.boneMass && errors.boneMass ? "red" : "gray"}
            activeOutlineColor={touched.boneMass && errors.boneMass ? "red" : "blue"}
          />
          {touched.boneMass && errors.boneMass && (
            <Text style={styles.error}>{errors.boneMass}</Text>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit as any}
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>Continuar</Text>
          </Button>
        </View>
      )}
    </Formik>
  );
};

const window = Dimensions.get("window");

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

export default AnthropometricRegister;