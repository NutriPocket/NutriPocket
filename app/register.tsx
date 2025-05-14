import React from "react";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../atoms/authAtom";
import { View, StyleSheet, Dimensions, Keyboard, TextInput as RNTextInput } from "react-native";
import { TextInput , Button, Text, IconButton } from "react-native-paper";
import { router } from "expo-router";
import axios from "axios";
import { Formik } from "formik";
import * as Yup from "yup";


const validationSchema = Yup.object({
  username: Yup.string().required("Por favor, ingresa tu nombre de usuario."),  
  email: Yup.string().email("Email inválido").required("Por favor, ingresa tu email."),
  password: Yup.string().required("Por favor, ingresa tu contraseña."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), ''], 'Las contraseñas no coinciden')
    .required('Por favor, confirma tu contraseña.'),
});

const Register = () => {
  const [auth, setIsAuthenticated] = useAtom(authenticatedAtom);
  const [error, setError] = React.useState<string | null>(null);

  const handleRegister = async (values: any) => {
    try {
        console.log("Form values: ", values);
        const data = {
          username: values.username,
          email: values.email,
          password: values.password,
        };

        const BASE_URL = process.env.USER_SERVICE_REGISTER_URL || "http://localhost:8080/auth/register";
        const response = await axios.post(`${BASE_URL}`,
          data,
          { headers: { "Content-Type": "application/json" } }
        );
        
        if (response.status === 201) {
          const { data, token } = response.data;
          const { id, email, username } = data;
          setIsAuthenticated({ id, email, username, token });
        }

       

        router.replace("/extraInfoRegister");
      } catch (err: any) {

        if (err.response && err.response.status === 400) {
          setError("Invalid email or password");
        } else if (err.response && err.response.status === 409) {
          setError("Username or email already exists, please try again.");
        }
      }
  };
  
  return (
    
    <Formik
      initialValues={{ username: "", email: "", password: "", confirmPassword: "" }}
      validationSchema={validationSchema}
      onSubmit={handleRegister}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <View style={styles.container}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => router.back()}
            style={styles.backButton}
            iconColor="white"
          />

          <Text style={styles.title}>Crea una cuenta</Text>
          <Text style={styles.subTitle}>Ingresa su información personal</Text>
          {error && (<Text style={{ color: "red", textAlign: "center", marginBottom: 10 }}>{error}</Text> )}  
          <TextInput
            label="Nombre"
            value={values.username}
            onChangeText={text => {handleChange("username")(text); setError(null)}} 
            onBlur={handleBlur("username")}
            style={styles.input}
            theme={{
              colors: {
                background: "white",
                onSurfaceVariant: touched.username && errors.username ? "red" : "black",
              },
            }}
            outlineColor={touched.username && errors.username ? "red" : "gray"}
            activeOutlineColor={touched.username && errors.username ? "red" : "blue"}
          />
          {touched.username && errors.username && (
            <Text style={styles.error}>{errors.username}</Text>
          )}


          <TextInput
            label="Mail"
            value={values.email}
            onChangeText={text => {handleChange("email")(text); setError(null)}}
            onBlur={handleBlur("email")}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            theme={{
              colors: {
                background: "white",
                onSurfaceVariant: touched.email && errors.email ? "red" : "black",
              },
            }}
            outlineColor={touched.email && errors.email ? "red" : "gray"}
            activeOutlineColor={touched.email && errors.email ? "red" : "blue"}
          />
          {touched.email && errors.email && (
            <Text style={styles.error}>{errors.email}</Text>
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
                onSurfaceVariant: touched.password && errors.password ? "red" : "black",
              },
            }}
            outlineColor={touched.password && errors.password ? "red" : "gray"}
            activeOutlineColor={touched.password && errors.password ? "red" : "blue"}
          />
          {touched.password && errors.password && (
            <Text style={styles.error}>{errors.password}</Text>
          )}
          <TextInput
            label="Confirmar Contraseña"
            value={values.confirmPassword}
            onChangeText={handleChange("confirmPassword")}
            onBlur={handleBlur("confirmPassword")}
            style={styles.input}
            secureTextEntry
            theme={{
              colors: {
                background: "white",
                onSurfaceVariant: touched.confirmPassword && errors.confirmPassword ? "red" : "black",
              },
            }}
            outlineColor={touched.confirmPassword && errors.confirmPassword ? "red" : "gray"}
            activeOutlineColor={touched.confirmPassword && errors.confirmPassword ? "red" : "blue"}
          />
          {touched.confirmPassword && errors.confirmPassword && (
            <Text style={styles.error}>{errors.confirmPassword}</Text>
          )}
          
          <Button mode="contained" onPress={handleSubmit as any} style={styles.RegisterButton}>
            <Text style={styles.RegisterButtonText}>Register</Text>
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
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 16,
    color: "white",
    fontWeight: "normal",
    textAlign: "center",
    marginTop: -20,
    marginBottom: 30,
  },
  input: {
    width: "100%",
    marginBottom: 15,
  },
  RegisterButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    marginTop: 10,
    width: "100%",
  },
  RegisterButtonText: {
    color: "#000000",
    fontSize: 16,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
});

export default Register;