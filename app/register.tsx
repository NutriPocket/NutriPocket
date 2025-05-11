import React, { useState, useRef } from "react";
import { View, StyleSheet, Dimensions, Keyboard, TextInput as RNTextInput, } from "react-native";
import { TextInput , Button, Text, Title } from "react-native-paper";
import { router } from "expo-router";
import axios from "axios";

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  
}

const Register = () => {
  const [form, setForm] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<RNTextInput | null>(null);
  const passwordRef = useRef<RNTextInput | null>(null);
  const confirmPasswordRef = useRef<RNTextInput | null>(null);
  const nameRef = useRef<RNTextInput | null>(null);

  const handleChange = (name: keyof RegisterForm, value: string) => {
    setForm({
      ...form,
      [name]: value,
    });
  };

  const closeInput = () => {
    Keyboard.dismiss();
    emailRef.current?.blur();
    passwordRef.current?.blur();
    confirmPasswordRef.current?.blur();
    nameRef.current?.blur();
  };

  const areValidFields = () => {
    if (form.email.trim().length === 0) {
      setError("Please enter a valid email.");
      return false;
    }

    if (form.password.trim().length === 0) {
      setError("Please enter a valid password.");
      return false;
    }
    if (form.confirmPassword.trim().length === 0) {
      setError("Please confirm your password.");
      return false;
    }
    if (form.username.trim().length === 0) {
      setError("Please enter your name.");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    setError(null); // Limpiar errores si los campos son válidos
    return true;
  };

  const handleRegister = async () => {
    closeInput();

    if (!areValidFields()) {
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/auth/register", {
        ...form,
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

      if (response.status === 200) {
        console.log("Register success: ", response.data);
        router.replace("/");
      }
    } catch (err: any) {
      if (err.response && err.response.status === 400) {
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
          label="Name"
          value={form.username}
          onChangeText={(text) => handleChange("username", text)}
          style={styles.input}
          ref={nameRef}
          theme={{
            colors: {
              background: "white",
              onSurfaceVariant: error && form.username.length === 0 ? "red" : "black",
            },
          }}
        outlineColor={error && form.username.length === 0 ? "red" : "gray"}
        activeOutlineColor={error && form.username.length === 0 ? "red" : "blue"}
        />
      <TextInput
        label="Email"
        value={form.email}
        onChangeText={(text) => handleChange("email", text)}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        ref={emailRef}
        theme={{
          colors: {
            background: "white",
            onSurfaceVariant: error && form.email.length === 0 ? "red" : "black",
          },
        }}
        outlineColor={error && form.email.length === 0 ? "red" : "gray"}
        activeOutlineColor={error && form.email.length === 0 ? "red" : "blue"}
      />
      <TextInput
        label="Password"
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
        <TextInput
            label="Confirm Password"
            value={form.confirmPassword}
            onChangeText={(text) => handleChange("confirmPassword", text)}
            style={styles.input}
            secureTextEntry
            ref={confirmPasswordRef}
            theme={{
            colors: {
                background: "white",
                onSurfaceVariant: error && form.confirmPassword.length === 0 ? "red" : "black",
            },
            }}
            outlineColor={error && form.confirmPassword.length === 0 ? "red" : "gray"}
            activeOutlineColor={error && form.confirmPassword.length === 0 ? "red" : "blue"}
        />

      {error && <Text style={styles.error}>{error}</Text>}
      <Button mode="contained" onPress={handleRegister} style={styles.Loginbutton}>
        <Text style={styles.LoginbuttonText}>Register</Text>
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
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
});

export default Register;