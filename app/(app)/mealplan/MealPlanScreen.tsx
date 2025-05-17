import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { mealPlanListStyles  } from "../../../styles/mealStyles";
import { homeStyles } from "../../../styles/homeStyles";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { useEffect, useState } from "react";
import { TouchableRipple } from "react-native-paper";
import useAxiosInstance from "@/hooks/useAxios"
import {MealPlanType} from "../../../types/mealTypes";
import HomeLayout from "../home/_layout";
import { parse } from "@babel/core";


export default function MealPlanScreen() {
  const [auth, setIsAuthenticated] = useAtom(authenticatedAtom);
  const [mealPlanList, setMealPlanList] = useState<MealPlanType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const axiosInstance = useAxiosInstance('food');

  const handleSelectPlan = (planId: string) => {

    try{
      const userId = auth?.id;
      
      if (!userId) {
        return;
      }
  
      if (!auth?.token) {
        return;
      }
  
      const response = axiosInstance.put(`/food/users/${userId}/plan`, 
        { 
          plan_id: parseInt(planId) 
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
        );
  
      console.log("Selected plan: ", response);
      setSelectedPlanId(planId);
    } catch (error) {
      console.error("Error selecting plan: ", error);
    }

  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {

        const userId = auth?.id;
        
        if (!userId) {
          return;
        }

        if (!auth?.token) {
          return;
        }

        const response = await axiosInstance.get(`/food/plans`);

        const data = response.data.plans;


        setMealPlanList(data);

        

      } catch (err) {
        setError("No se pudieron obtener los datos del usuario.");
      }
    };
    if (auth?.id && auth?.token) {
      fetchUserData();
    }
  }, []);


  return (  
    <ScrollView contentContainerStyle={homeStyles.formContainer}>
      <Text style={homeStyles.sectionTitle}> Plan de Comidas </Text>
      <View style={{ marginTop: 20 }}>
        {mealPlanList.map((plan: MealPlanType) => (

          <TouchableRipple
            key={plan.id_plan}
            style={[
              mealPlanListStyles.planCard,
              selectedPlanId === plan.id_plan && { borderColor: "#287D76", borderWidth: 2 }
      ]}

      onPress={() => handleSelectPlan(plan.id_plan)}

    >
      <View>
        <Text style={mealPlanListStyles.planName}>{plan.title}</Text>
        <Text style={mealPlanListStyles.planDescription}>{plan.plan_description}</Text>
        <Text style={{ fontSize: 13, color: "#888" }}>{plan.objective}</Text>
        {selectedPlanId === plan.id_plan && (
          <Text style={{ color: "#287D76", marginTop: 8, fontWeight: "bold" }}>
            Seleccionado
          </Text>
        )}
      </View>
    </TouchableRipple>
  ))}
</View>
  </ScrollView>
);
}
