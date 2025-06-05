import React, { useRef } from "react";
import { useAtom } from "jotai";
import {
  View,
  StyleSheet,
  Dimensions,
  Keyboard,
  TextInput as RNTextInput,
} from "react-native";
import { authenticatedAtom } from "../atoms/authAtom";
import { TextInput, Button, Text } from "react-native-paper";
import { router } from "expo-router";
import axios from "axios";
import { Formik } from "formik";
import { Image } from "react-native";
import { loginValidationSchema } from "../utils/validationSchemas";
import useAxiosInstance from "@/hooks/useAxios";

const Login = () => {
  const [, setIsAuthenticated] = useAtom(authenticatedAtom);
  const [error, setError] = React.useState<string | null>(null);
  const axiosInstance = useAxiosInstance("users");

  const handleLogin = async (values: any) => {
    try {
      const response = await axiosInstance.post(
        "/auth/login",
        {
          ...values,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.status === 200) {
        const { data, token } = response.data;
        const { id, email, username } = data;
        setIsAuthenticated({ id, email, username, token });
        router.replace("/(app)"); // Redirige a la pantalla de tabs Home
      }
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setError("Mail o contraseña incorrectos");
      } else {
        setError("Un error inesperado ha ocurrido, intenta nuevamente.");
      }
    }
  };

  const handleCreateAccount = () => {
    router.push("/register");
  };

  return (
    <Formik
      initialValues={{ emailOrUsername: "", password: "" }}
      validationSchema={loginValidationSchema}
      onSubmit={handleLogin}
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
          <Image
            source={require("../assets/images/logo_primary.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <TextInput
            label="Mail"
            value={values.emailOrUsername}
            onChangeText={handleChange("emailOrUsername")}
            onBlur={handleBlur("emailOrUsername")}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            theme={{
              colors: {
                background: "white",
                onSurfaceVariant:
                  touched.emailOrUsername && errors.emailOrUsername
                    ? "red"
                    : "black",
              },
            }}
            outlineColor={
              touched.emailOrUsername && errors.emailOrUsername ? "red" : "gray"
            }
            activeOutlineColor={
              touched.emailOrUsername && errors.emailOrUsername ? "red" : "blue"
            }
          />
          {touched.emailOrUsername && errors.emailOrUsername && (
            <Text style={styles.error}>{errors.emailOrUsername}</Text>
          )}
          <TextInput
            label="Contraseña"
            value={values.password}
            onChangeText={handleChange("password")}
            onBlur={handleBlur("password")}
            style={styles.input}
            secureTextEntry
            theme={{
              colors: {
                background: "white",
                onSurfaceVariant:
                  touched.password && errors.password ? "red" : "black",
              },
            }}
            outlineColor={touched.password && errors.password ? "red" : "gray"}
            activeOutlineColor={
              touched.password && errors.password ? "red" : "blue"
            }
          />
          {touched.password && errors.password && (
            <Text style={styles.error}>{errors.password}</Text>
          )}
          {error && <Text style={styles.error}>{error}</Text>}
          <Button
            mode="contained"
            onPress={handleSubmit as any}
            style={styles.Loginbutton}
          >
            <Text style={styles.LoginbuttonText}>Login</Text>
          </Button>
          <Button
            mode="outlined"
            onPress={handleCreateAccount}
            style={styles.NewAccountButton}
          >
            <Text style={styles.NewAccountButtonText}>Create New Account</Text>
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
    marginBottom: 20,
  },
  input: {
    width: "100%",
    marginBottom: 15,
  },
  Loginbutton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    marginTop: 10,
    width: "100%",
  },
  LoginbuttonText: {
    color: "#000000",
    fontSize: 16,
  },
  NewAccountButton: {
    backgroundColor: "#287D76",
    borderRadius: 5,
    borderColor: "#FFFFFF",
    borderWidth: 2,
    marginTop: 20,
    width: "100%",
  },
  NewAccountButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 20,
    alignSelf: "center",
  },
});

export default Login;
