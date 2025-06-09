import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { homeStyles } from "../../../styles/homeStyles";
import { selectedPlanIdAtom } from "../../../atoms/mealPlanAtom";
import useAxiosInstance from "@/hooks/useAxios";
import { ItineraryPlan } from "../../../types/mealTypes";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";

export default function HomeScreen() {
  const [auth] = useAtom(authenticatedAtom);
  const [selectedPlanId] = useAtom(selectedPlanIdAtom);
  const axiosInstance = useAxiosInstance("food");
  const [itinerary, setItinerary] = useState<ItineraryPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const screenWidth = Dimensions.get("window").width;

  const days = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  const today = days[new Date().getDay()];
  const todaysFood = itinerary?.weekly_plan?.[today] || null;

  // Datos de ejemplo para los gráficos
  const caloriesData = {
    labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    datasets: [
      {
        data: [1800, 2100, 1950, 2200, 1750, 2300, 1900],
        color: (opacity = 1) => `rgba(40, 125, 118, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const nutritionData = {
    labels: ["Proteínas", "Carbohidratos", "Grasas", "Fibra"],
    datasets: [
      {
        data: [120, 280, 65, 25], // gramos
        colors: [
          (opacity = 1) => `rgba(40, 125, 118, ${opacity})`,
          (opacity = 1) => `rgba(74, 158, 150, ${opacity})`,
          (opacity = 1) => `rgba(108, 191, 182, ${opacity})`,
          (opacity = 1) => `rgba(142, 224, 214, ${opacity})`,
        ],
      },
    ],
  };

  const weightData = {
    labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5"],
    datasets: [
      {
        data: [75.2, 74.8, 74.5, 74.1, 73.8],
        color: (opacity = 1) => `rgba(40, 125, 118, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(40, 125, 118, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: "#e0e0e0",
      strokeWidth: 1,
    },
    fillShadowGradient: "#287D76",
    fillShadowGradientOpacity: 0.3,
    barPercentage: 0.4, // Ajusta el ancho de las barras
    useShadowColorFromDataset: false, // Desactiva el uso de colores de sombra
  };

  useEffect(() => {
    const fetchPlan = async () => {
      if (!selectedPlanId) return;
      try {
        const response = await axiosInstance.get(`/plans/${selectedPlanId}`);
        setItinerary(response.data.data);
      } catch (err) {
        setError("No se pudo cargar el plan de comidas.");
      }
    };
    fetchPlan();
  }, [selectedPlanId]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 100,
        gap: 20,
      }}
    >
      <View>
        <Text style={homeStyles.welcome}>
          ¡Bienvenido/a, {auth?.username || "usuario"}!
        </Text>
        <Text style={homeStyles.info}>Aquí verás tu resumen y novedades.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Comidas de hoy</Text>
        {error ? (
          <Text style={{ color: "red" }}>{error}</Text>
        ) : todaysFood ? (
          Object.entries(todaysFood).map(([moment, meal]) => (
            <View key={moment} style={styles.momentRow}>
              <Text style={styles.momentLabel}>{moment}</Text>
              {meal ? (
                <View style={{ padding: 0 }}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealDesc} numberOfLines={1}>
                    {meal.description}
                  </Text>
                </View>
              ) : (
                <Text style={styles.mealDesc}>No hay comida asignada</Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noMeal}>No hay comidas para hoy.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Calorías Semanales</Text>
        <View style={styles.chartContainer}>
          <View style={[styles.chartWrapper, { width: "100%" }]}>
            <LineChart
              data={caloriesData}
              width={screenWidth - 80} // Ajusta el ancho considerando el padding y márgenes
              height={240}
              chartConfig={chartConfig}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={true}
              withHorizontalLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              yAxisSuffix=" cal"
              style={{
                borderRadius: 16,
              }}
            />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nutrición Diaria</Text>
        <View style={styles.chartContainer}>
          <View style={[styles.chartWrapper, { width: "100%" }]}>
            <PieChart
              data={nutritionData.datasets[0].data.map((value, index) => ({
                name: nutritionData.labels[index],
                population: value,
                color: nutritionData.datasets[0].colors[index](1),
                legendFontColor: "#333",
                legendFontSize: 12,
              }))}
              width={Dimensions.get("window").width - 40} // Restaurar la propiedad width
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              style={{
                borderRadius: 16,
              }}
            />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Progreso de Peso</Text>
        <View style={styles.chartContainer}>
          <View style={[styles.chartWrapper, { width: "100%" }]}>
            <LineChart
              data={weightData}
              width={Dimensions.get("window").width - 40} // Restaurar la propiedad width
              height={240}
              chartConfig={chartConfig}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={true}
              withHorizontalLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              yAxisSuffix=" kg"
              style={{
                borderRadius: 16,
              }}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: "#287D76",
    padding: 20,
    gap: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#287D76",
    textAlign: "center",
  },
  momentRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  momentLabel: {
    fontWeight: "600",
    color: "#287D76",
    fontSize: 16,
    flex: 1,
  },
  mealInfo: {
    flex: 2,
    paddingLeft: 10,
  },
  mealName: {
    fontWeight: "600",
    color: "#333",
    fontSize: 15,
    marginBottom: 2,
  },
  mealDesc: {
    color: "#666",
    fontSize: 13,
    lineHeight: 18,
  },
  noMeal: {
    paddingVertical: 20,
    textAlign: "center",
    color: "#888",
    fontSize: 14,
    fontStyle: "italic",
  },
  chartContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  chartWrapper: {
    paddingHorizontal: 30,
    overflow: "hidden",
    alignItems: "center",
  },
});
