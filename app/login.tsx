import React, { useState, useRef } from "react";
import { useAtom } from "jotai";
import { View, StyleSheet, Dimensions, Keyboard, TextInput as RNTextInput } from "react-native";
import { authenticatedAtom } from "../atoms/authAtom";
import { TextInput , Button, Text } from "react-native-paper";
import { router } from "expo-router";
import axios from "axios";

interface loginForm {
  emailOrUsername: string;
  password: string;
}

const Login = () => {
  const [form, setForm] = useState<loginForm>({
    emailOrUsername: "",
    password: "",
  });
  
  const [, setIsAuthenticated] = useAtom(authenticatedAtom);
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<RNTextInput | null>(null);
  const passwordRef = useRef<RNTextInput | null>(null);

  const handleChange = (name: keyof loginForm, value: string) => {
    setForm({
      ...form,
      [name]: value,
    });
  };

  const closeInput = () => {
    Keyboard.dismiss();
    emailRef.current?.blur();
    passwordRef.current?.blur();
  };

  const areValidFields = () => {
    if (form.emailOrUsername.trim().length === 0) {
      setError("Please enter a valid email or username.");
      return false;
    }

    if (form.password.trim().length === 0) {
      setError("Please enter a valid password.");
      return false;
    }

    setError(null); // Limpiar errores si los campos son válidos
    return true;
  };

  const handleLogin = async () => {
    closeInput();

    if (!areValidFields()) {
      return;
    }

    try {
      const LOGIN_URL = process.env.USER_SERVICE_LOGIN_URL || "http://localhost:8080/auth/login";
      const response = await axios.post(LOGIN_URL, {
        ...form,
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

      if (response.status === 200) {
        console.log("Login success: ", response.data);
        
        const {data, token} = response.data;
        const {id, email, username} = data;

        setIsAuthenticated({id, email, username, token});
        router.replace("/home");
      }
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setError("Invalid email or password");
      } else {
        setError("An error occurred. Please try again later.");
      }
    }
  };

  const handleCreateAccount = () => {
    router.push("/register");
  };
  
  return (
    <View style={styles.container}>
      <TextInput
        label="Mail"
        value={form.emailOrUsername}
        onChangeText={(text) => handleChange("emailOrUsername", text)}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        ref={emailRef}
        theme={{
          colors: {
            background: "white",
            onSurfaceVariant: error && form.emailOrUsername.length === 0 ? "red" : "black",
          },
        }}
        outlineColor={error && form.emailOrUsername.length === 0 ? "red" : "gray"}
        activeOutlineColor={error && form.emailOrUsername.length === 0 ? "red" : "blue"}
      />
      <TextInput
        label="Contraseña"
        value={form.password}
        onChangeText={(text) => handleChange("password", text)}
        style={styles.input}
        secureTextEntry
        ref={passwordRef}
        theme={{
          colors: {
            background: "white",
            onSurfaceVariant: error && form.password.length === 0 ? "red" : "black",
          },
        }}
        outlineColor={error && form.password.length === 0 ? "red" : "gray"}
        activeOutlineColor={error && form.password.length === 0 ? "red" : "blue"}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button mode="contained" onPress={handleLogin} style={styles.Loginbutton}>
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
});

export default Login;