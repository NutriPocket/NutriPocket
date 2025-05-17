import React from "react";
import { View, Text } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { useNavigation } from "expo-router";
import { useState } from "react";
import useAxiosInstance from "@/hooks/useAxios";
import { MealPlanType } from "../../../types/mealTypes"; 
import { mealPlanListStyles } from "@/styles/mealStyles";
import { homeStyles } from "../../../styles/homeStyles";
import { Formik } from "formik";


export default function CreateMealPlanScreen() {
  const navigation = useNavigation();
  const axiosInstance = useAxiosInstance('food');
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

   const handleConfirm = async () => {
//     try {
//       // Completa con los datos y endpoint correctos según tu backend
//       await axiosInstance.post("/food/plans", {
//         title,
//         objective,
//         description,
//       });
//       navigation.goBack(); // Vuelve a la pantalla anterior
//     } catch (err) {
//       setError("Error al crear el plan");
//     }

// try{
//       const userId = auth?.id;
      
//       if (!userId) {
//         return;
//       }
  
//       if (!auth?.token) {
//         return;
//       }
  
//       const response = axiosInstance.post(`/food/plans/${userId}/`, 
//         { 
//           plan_id: parseInt(planId) 
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//         );
  
//       console.log("Selected plan: ", response);
//       setSelectedPlanId(planId);
//     } catch (error) {
//       console.error("Error selecting plan: ", error);
//     }
  };

//   return (
//     <View style={homeStyles.formContainer}>
//       <Text style={homeStyles.sectionTitle}>Crear nuevo plan</Text>

//       <TextInput label="Título" value={title} onChangeText={setTitle} style={mealPlanListStyles.planName} />
//       <TextInput label="Objetivo" value={objective} onChangeText={setObjective} style={mealPlanListStyles.planDescription} />
//       <TextInput label="Descripción" value={description} onChangeText={setDescription} style={mealPlanListStyles.planDescription} />
//       {error && <Text style={{ color: "red" }}>{error}</Text>}
//       <Button mode="contained" onPress={handleConfirm}>Confirmar</Button>
//     </View>
//   );

    return (
    <Formik
      initialValues={{ emailOrUsername: "", password: "" }}
      validationSchema={loginValidationSchema}
      onSubmit={handleLogin}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <View style={styles.container}>
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
                onSurfaceVariant: touched.emailOrUsername && errors.emailOrUsername ? "red" : "black",
              },
            }}
            outlineColor={touched.emailOrUsername && errors.emailOrUsername ? "red" : "gray"}
            activeOutlineColor={touched.emailOrUsername && errors.emailOrUsername ? "red" : "blue"}
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
                onSurfaceVariant: touched.password && errors.password ? "red" : "black",
              },
            }}
            outlineColor={touched.password && errors.password ? "red" : "gray"}
            activeOutlineColor={touched.password && errors.password ? "red" : "blue"}
          />
          {touched.password && errors.password && (
            <Text style={styles.error}>{errors.password}</Text>
          )}
          {error && <Text style={styles.error}>{error}</Text>}
          <Button mode="contained" onPress={handleSubmit as any} style={styles.Loginbutton}>
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
}