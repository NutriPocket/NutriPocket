import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";

// Pantalla Home principal
function HomeScreen() {
  const [auth] = useAtom(authenticatedAtom);
  return (
    <View style={styles.screenContainer}>
      <Text style={styles.welcome}>¡Bienvenido/a, {auth?.username || 'usuario'}!</Text>
      <Text style={styles.info}>Aquí verás tu resumen y novedades.</Text>
    </View>
  );
}

// Pantalla para modificar datos antropométricos
function UserScreen() {
  return (
    <View style={styles.screenContainer}>
      <Text style={styles.sectionTitle}>Tus datos antropométricos</Text>
      <Text style={styles.info}>Aquí podrás modificar tus datos antropométricos.</Text>
      {/* Aquí puedes agregar un botón o formulario para editar los datos */}
    </View>
  );
}

// Pantalla para establecer un nuevo plan de comidas
function MealPlanScreen() {
  return (
    <View style={styles.screenContainer}>
      <Text style={styles.sectionTitle}>Plan de comidas</Text>
      <Text style={styles.info}>Aquí podrás establecer o modificar tu plan de comidas.</Text>
      {/* Aquí puedes agregar un formulario o lista de planes */}
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function HomeTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#287D76',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#287D76' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="User"
        component={UserScreen}
        options={{
          tabBarLabel: 'Usuario',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MealPlan"
        component={MealPlanScreen}
        options={{
          tabBarLabel: 'Plan de comidas',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="food" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  welcome: {
    fontSize: 24,
    color: '#287D76',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#287D76',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    color: '#287D76',
    textAlign: 'center',
  },
});