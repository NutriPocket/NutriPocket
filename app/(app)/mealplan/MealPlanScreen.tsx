import React from "react";
import { View, Text } from "react-native";
import { styles } from "../../../styles/homeStyles";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { useEffect, useState } from "react";
import axios from "axios";
import { TextInput, Button } from "react-native-paper";


export default function MealPlanScreen() {
  const [auth, setIsAuthenticated] = useAtom(authenticatedAtom);
  const [mealPlanList, setMealPlanList] = useState([])
  const [error, setError] = useState<string | null>(null);

  
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const BASE_URL = process.env.MEAL_SERVICE_URL || "http://localhost:8082";

        const userId = auth?.id;
        
        if (!userId) {
          return;
        }

        if (!auth?.token) {
          return;
        }

        const response = await axios.get(`${BASE_URL}/food/plans`, {
          headers: {
            'Content-Type': 'application/json',
            //Authorization: `Bearer ${auth?.token}`,
          },
        });

        const data = response.data.plans;
        console.log("Plan list ", data);


        setMealPlanList(data);
        console.log("User data set: ", data);

      } catch (err) {
        setError("No se pudieron obtener los datos del usuario.");
      }
    };
    if (auth?.id && auth?.token) {
      fetchUserData();
    }
  }, []);

  
  
  return (
    <View style={styles.screenContainer}>
      <Text style={styles.sectionTitle}>Plan de comidas</Text>
      <Text style={styles.info}>Aquí podrás establecer o modificar tu plan de comidas.</Text>
      {/* Aquí puedes agregar un formulario o lista de planes */}
    </View>
  );
}
