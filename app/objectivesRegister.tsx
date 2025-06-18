import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { Formik } from "formik";
import { router } from "expo-router";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../atoms/authAtom";
import { objectiveValidationSchema } from "../utils/validationSchemas";
import useAxiosInstance from "@/hooks/useAxios";

const ObjectivesRegister = () => {
  const [auth, setIsAuthenticated] = useAtom(authenticatedAtom);
  const [error, setError] = useState<string | null>(null);
  const axiosProgress = useAxiosInstance("progress");

  const handleSubmit = async (values: any) => {
    const data = {
      weight: parseFloat(values.weight),
      muscle_mass: values.muscleMass ? parseFloat(values.muscleMass) : null,
      fat_mass: values.fatMass ? parseFloat(values.fatMass) : null,
      bone_mass: values.boneMass ? parseFloat(values.boneMass) : null,
      deadline: values.deadline ? values.deadline : null,
    };
    try {
      const userId = auth?.id;
      const response = await axiosProgress.put(
        `/users/${userId}/objectives/`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 201 || response.status === 200) {
        setIsAuthenticated((prev) =>
          prev
            ? {
                ...prev,
                objectives: data,
              }
            : prev
        );
        router.replace("/(app)");
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
        weight: "",
        muscleMass: "",
        fatMass: "",
        boneMass: "",
        deadline: "",
      }}
      validationSchema={objectiveValidationSchema}
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
          <Text style={styles.title}>Cargar Objetivos</Text>
          <TextInput
            label="Fecha objetivo (YYYY-MM-DD)"
            value={values.deadline}
            onChangeText={handleChange("deadline")}
            onBlur={handleBlur("deadline")}
            style={styles.input}
            keyboardType="default"
            theme={{
              colors: {
                background: "white",
                onSurfaceVariant:
                  touched.deadline && errors.deadline ? "red" : "black",
              },
            }}
            outlineColor={touched.deadline && errors.deadline ? "red" : "gray"}
            activeOutlineColor={
              touched.deadline && errors.deadline ? "red" : "blue"
            }
            placeholder="YYYY-MM-DD"
          />
          {touched.deadline && errors.deadline && (
            <Text style={styles.error}>{errors.deadline}</Text>
          )}
          <TextInput
            label="Peso objetivo (kg)"
            value={values.weight}
            onChangeText={handleChange("weight")}
            onBlur={handleBlur("weight")}
            style={styles.input}
            keyboardType="numeric"
            theme={{
              colors: {
                background: "white",
                onSurfaceVariant:
                  touched.weight && errors.weight ? "red" : "black",
              },
            }}
            outlineColor={touched.weight && errors.weight ? "red" : "gray"}
            activeOutlineColor={
              touched.weight && errors.weight ? "red" : "blue"
            }
          />
          {touched.weight && errors.weight && (
            <Text style={styles.error}>{errors.weight}</Text>
          )}

          <TextInput
            label="Masa muscular objetivo (%) (opcional)"
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
            outlineColor={
              touched.muscleMass && errors.muscleMass ? "red" : "gray"
            }
            activeOutlineColor={
              touched.muscleMass && errors.muscleMass ? "red" : "blue"
            }
          />
          {touched.muscleMass && errors.muscleMass && (
            <Text style={styles.error}>{errors.muscleMass}</Text>
          )}

          <TextInput
            label="Porcentaje de grasa objetivo (%) (opcional)"
            value={values.fatMass}
            onChangeText={handleChange("fatMass")}
            onBlur={handleBlur("fatMass")}
            style={styles.input}
            keyboardType="numeric"
            theme={{
              colors: {
                background: "white",
                onSurfaceVariant:
                  touched.fatMass && errors.fatMass ? "red" : "black",
              },
            }}
            outlineColor={touched.fatMass && errors.fatMass ? "red" : "gray"}
            activeOutlineColor={
              touched.fatMass && errors.fatMass ? "red" : "blue"
            }
          />
          {touched.fatMass && errors.fatMass && (
            <Text style={styles.error}>{errors.fatMass}</Text>
          )}

          <TextInput
            label="Masa ósea objetivo (%) (opcional)"
            value={values.boneMass}
            onChangeText={handleChange("boneMass")}
            onBlur={handleBlur("boneMass")}
            style={styles.input}
            keyboardType="numeric"
            theme={{
              colors: {
                background: "white",
                onSurfaceVariant:
                  touched.boneMass && errors.boneMass ? "red" : "black",
              },
            }}
            outlineColor={touched.boneMass && errors.boneMass ? "red" : "gray"}
            activeOutlineColor={
              touched.boneMass && errors.boneMass ? "red" : "blue"
            }
          />
          {touched.boneMass && errors.boneMass && (
            <Text style={styles.error}>{errors.boneMass}</Text>
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
