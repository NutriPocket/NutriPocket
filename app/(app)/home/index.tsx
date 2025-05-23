import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import HomeScreen from "./HomeScreen";
import UserScreen from "../user/UserScreen";
import MealPlanScreen from "../mealplan/MealPlanScreen";
import GroupsScreen from "../groups/GroupsScreen";
import PlanView from "../mealplan/PlanView";
import { useAtom, useAtomValue } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { Redirect } from "expo-router";
import { selectedPlanIdAtom } from "../../../atoms/mealPlanAtom";

const Tab = createBottomTabNavigator();

export default function HomeTabs() {
  const isAuthenticated = useAtom(authenticatedAtom);
  const selectedPlanId = useAtomValue(selectedPlanIdAtom);

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#287D76",
        tabBarInactiveTintColor: "#aaa",
        tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#287D76" },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="User"
        component={UserScreen}
        options={{
          tabBarLabel: "Usuario",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MealPlan"
        component={selectedPlanId ? PlanView : MealPlanScreen}
        key={selectedPlanId ? `plan-${selectedPlanId}` : "mealplan-list"}
        options={{
          tabBarLabel: "Plan de comidas",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="food" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupsScreen}
        options={{
          tabBarLabel: "Groups",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-group"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
