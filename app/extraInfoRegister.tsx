import React from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { Formik } from "formik";
import axios from "axios";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../atoms/authAtom";
import { router } from "expo-router";
import { extraInfoValidationSchema } from "../utils/validationSchemas";
import useAxiosInstance from "@/hooks/useAxios"



const ExtraInfoRegister = () => {

    const [auth, setIsAuthenticated] = useAtom(authenticatedAtom);
    const [error, setError] = React.useState<string | null>(null);
    const axiosInstance  = useAxiosInstance('progress');
  
  
    const handleExtraRegister = async (values: any) => {
        const data = {
            birthday: values.birthday,
            height: parseInt(values.height, 10),
        };

        try {

            const userId = auth?.id;

            const response = await axiosInstance.put( `/users/${userId}/fixedData/`,
                data,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.status === 200 || response.status === 201) {
                setIsAuthenticated((prev) => prev
                    ? {
                        ...prev,
                        birthday: data.birthday,
                        height: data.height,
                        username: prev.username,
                        birthdate: prev.birthdate,
                        email: prev.email,
                        weight: prev.weight,
                        muscleMass: prev.muscleMass,
                        bodyFatPercentage: prev.bodyFatPercentage,
                        boneMass: prev.boneMass,
                        token: prev.token,
                    }
                    : prev
                );
                console.log("Extra info registered successfully");
                console.log("Response data: ", response.data);

                router.replace("/anthropometricRegister");
            }

        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.status === 400) {
                    setError("Invalid data");
                } else {
                    setError("An error occurred. Please try again later.");
                }
            } else {
                setError("An error occurred. Please try again later.");
            }
            console.error("Error registering extra info:", error);
        }

    };



  return (
    <Formik
      initialValues={{ height: "", birthday: "" }}
      validationSchema={extraInfoValidationSchema}
      onSubmit={handleExtraRegister}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <View style={styles.container}>
          <Text style={styles.title}>¡Queremos conocerte más!</Text>
          <Text style={styles.subTitle}>Completá estos datos para personalizar tu experiencia</Text>

          <TextInput
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
          )}

          <TextInput
            label="Fecha de nacimiento"
            value={values.birthday}
            onChangeText={handleChange("birthday")}
            onBlur={handleBlur("birthday")}
            style={styles.input}
            placeholder="YYYY-MM-DD"
            theme={{
              colors: {
                background: "white",
                onSurfaceVariant: touched.birthday && errors.birthday ? "red" : "black",
              },
            }}
            outlineColor={touched.birthday && errors.birthday ? "red" : "gray"}
            activeOutlineColor={touched.birthday && errors.birthday ? "red" : "blue"}
          />
          {touched.birthday && errors.birthday && (
            <Text style={styles.error}>{errors.birthday}</Text>
          )}

            {error && <Text style={styles.error}>{error}</Text>}

          <Button mode="contained" onPress={handleSubmit as any} style={styles.submitButton}>
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
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginBottom: 30,
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

export default ExtraInfoRegister;
