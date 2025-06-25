import { IndicatorList } from "@/components/IndicatorList";
import { PhysicalActivity } from "@/types/physicalActivityTypes";
import { View, StyleSheet } from "react-native";

interface Props {
  waterConsumption?: number;
  expectedCalories?: number;
  consumedCalories?: number;
  consumedProteins?: number;
  consumedCarbs?: number;
  consumedFibers?: number;
  burnedCalories?: number;
  physicalActivity?: PhysicalActivity[];
}

export const DailyResumeTab: React.FC<Props> = ({
  waterConsumption = 0,
  expectedCalories = 0,
  consumedCalories = 0,
  burnedCalories = 0,
  consumedProteins = 0,
  consumedCarbs = 0,
  consumedFibers = 0,
  physicalActivity = [],
}) => {
  return (
    <View style={{ padding: 16, gap: 16 }}>
      <IndicatorList
        title={""}
        indicators={[
          {
            icon: "bullseye-arrow",
            value: consumedCalories
              ? expectedCalories
                ? `${
                    Math.round((consumedCalories / expectedCalories) * 10000) /
                    100
                  }%`
                : "0%"
              : "0%",
            label: "Calorías diarias alcanzadas",
            color: "#287D76",
          },
          {
            icon: "scale-balance",
            value: consumedCalories
              ? burnedCalories
                ? `${consumedCalories - burnedCalories} cal`
                : `${consumedCalories} cal`
              : burnedCalories
              ? `-${burnedCalories} cal`
              : "0 cal",
            label: "Balance calórico",
            color: "#287D76",
          },
        ]}
      />
      <IndicatorList
        title={"Resumen nutricional"}
        indicators={[
          {
            icon: "hamburger",
            value: consumedCalories ? `${consumedCalories} cal` : "0 cal",
            label: "Calorías consumidas",
            color: "#FF5733", // Distinct color for calories
          },
          {
            icon: "food-turkey",
            value: consumedProteins ? `${consumedProteins} g` : "0 g",
            label: "Proteínas consumidas",
            color: "#C70039", // Distinct color for proteins
          },
          {
            icon: "pasta",
            value: consumedCarbs ? `${consumedCarbs} g` : "0 g",
            label: "Carbohidratos consumidas",
            color: "#FFC300", // Distinct color for carbs
          },
          {
            icon: "food-apple",
            value: consumedFibers ? `${consumedFibers} g` : "0 g",
            label: "Fibras consumidas",
            color: "#6A994E", // Neutral and visually appealing green for fibers
          },

          {
            icon: "water",
            value: waterConsumption ? `${waterConsumption} ml` : "0 ml",
            label: "Agua consumida",
            color: "#2196F3", // Existing color for water
          },
        ]}
      />

      <IndicatorList
        title={"Actividad física"}
        indicators={[
          {
            icon: "fire",
            value: burnedCalories ? `${burnedCalories} cal` : "0 cal",
            label: "Calorías quemadas",
            color: "red",
          },
          {
            icon: "weight-lifter",
            value: physicalActivity ? physicalActivity.length : "0",
            label: "Sesiones de actividad física",
            color: "#FF9800", // Existing color for physical activity
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    gap: 16,
    padding: 16,
  },
});
