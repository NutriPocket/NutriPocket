import { useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { Formik } from "formik";
import { router } from "expo-router";
import axios from "axios";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../atoms/authAtom";
import { anthropometricValidationSchema } from "../utils/validationSchemas";



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
      validationSchema={anthropometricValidationSchema}
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
            label="Masa Muscular (%) (opcional) "
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
            label="Masa ósea (%) (opcional)"
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