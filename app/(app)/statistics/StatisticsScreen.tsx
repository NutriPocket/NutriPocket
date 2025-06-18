import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, IconButton } from "react-native-paper";
import Header from "@/components/Header";
import LineChart, {
  LineChartDataPoint,
  LineChartSeries,
} from "@/components/LineChart";
import useAxiosInstance from "@/hooks/useAxios";
import { useAtom } from "jotai";
import { authenticatedAtom } from "@/atoms/authAtom";
import { AnthropometricType, ObjectiveType } from "@/types/anthropometricTypes";
import { useFocusEffect } from "@react-navigation/native";

export default function StatisticsScreen() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const axiosInstance = useAxiosInstance("progress");
  const [auth] = useAtom(authenticatedAtom);
  const [objectiveData, setObjectiveData] = useState<ObjectiveType | null>(
    null
  );
  const [anthropometricData, setAnthropometricData] = useState<
    {
      created_at: Date;
      anthropometric: AnthropometricType;
    }[]
  >([]);
  const [filteredData, setFilteredData] = useState<boolean>(false);
  const userId = auth?.id;

  const thisYear = new Date().getFullYear();
  console.log("Año actual:", thisYear);

  const createObjectiveData = (objective: string): LineChartDataPoint[] => {
    if (!objectiveData) return [];

    if (filteredData) {
      return [
        {
          x: new Date(startDate).getTime(),
          y: Number(objective),
        },
        {
          x: new Date(endDate).getTime(),
          y: Number(objective),
        },
      ];
    } else if (anthropometricData.length > 0) {
      return [
        {
          x: new Date(anthropometricData[0].created_at).getTime(),
          y: Number(objective),
        },
        {
          x: new Date(
            anthropometricData[anthropometricData.length - 1].created_at
          ).getTime(),
          y: Number(objective),
        },
      ];
    }

    return [];
  };

  const muscleMassSeries: LineChartSeries[] = [
    {
      label: "Masa Muscular",
      color: "#287D76",
      data: anthropometricData
        .filter(
          ({ anthropometric }) =>
            anthropometric.muscleMass !== null &&
            anthropometric.muscleMass !== undefined
        )
        .map(({ created_at: date, anthropometric }) => ({
          x: new Date(date).getTime(),
          y: Number(anthropometric.muscleMass),
        })),
      showPoints: true,
    },
    {
      label: "Objetivo",
      color: "#FF0000",
      data: createObjectiveData(objectiveData ? objectiveData.muscleMass : "0"),
      strokeDasharray: "6 6",
    },
  ];

  const weightSeries: LineChartSeries[] = [
    {
      label: "Peso",
      color: "#287D76",
      data: anthropometricData.map(({ created_at: date, anthropometric }) => ({
        x: new Date(date).getTime(),
        y: Number(anthropometric.weight),
      })),
      showPoints: true,
    },
    {
      label: "Objetivo",
      color: "#FF0000",
      data: createObjectiveData(objectiveData ? objectiveData.weight : "0"),
      strokeDasharray: "6 6",
    },
  ];

  const boneMassSeries: LineChartSeries[] = [
    {
      label: "Masa Ósea",
      color: "#287D76",
      data: anthropometricData
        .filter(
          ({ anthropometric }) =>
            anthropometric.boneMass !== null &&
            anthropometric.boneMass !== undefined
        )
        .map(({ created_at: date, anthropometric }) => ({
          x: new Date(date).getTime(),
          y: Number(anthropometric.boneMass),
        })),
      showPoints: true,
    },
    {
      label: "Objetivo",
      color: "#FF0000",
      data: createObjectiveData(objectiveData ? objectiveData.boneMass : "0"),
      strokeDasharray: "6 6",
    },
  ];

  const fatMassSeries: LineChartSeries[] = [
    {
      label: "Porcentaje Graso",
      color: "#287D76",
      data: anthropometricData
        .filter(
          ({ anthropometric }) =>
            anthropometric.bodyMass !== null &&
            anthropometric.bodyMass !== undefined
        )
        .map(({ created_at: date, anthropometric }) => ({
          x: new Date(date).getTime(),
          y: Number(anthropometric.bodyMass),
        })),
      showPoints: true,
    },
    {
      label: "Objetivo",
      color: "#FF0000",
      data: createObjectiveData(objectiveData ? objectiveData.bodyMass : "0"),
      strokeDasharray: "6 6",
    },
  ];

  const handleSearch = () => {
    if (!startDate || !endDate) {
      console.warn("Por favor, ingresa ambas fechas.");
      return;
    }

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (start >= end) {
      console.warn("La fecha de inicio debe ser anterior a la fecha de fin.");
      return;
    }
    fetchAnthropometricDataInRange(start, end);
    setFilteredData(true);
  };

  const fetchObjectiveData = async () => {
    try {
      const response = await axiosInstance.get(`/users/${userId}/objectives/`);
      const data = response.data.data;
      setObjectiveData({
        weight: data.weight || "0",
        muscleMass: data.muscle_mass,
        bodyMass: data.fat_mass,
        boneMass: data.bone_mass,
        deadline: data.deadline || "",
      });

      if (data) {
        setFilteredData(false); // Reset filter state when fetching new objective data
      }
    } catch (error) {
      console.error("Error fetching objective data: ", error);
    }
  };

  const mapAnthropometricData = (data: any[]) => {
    return data.map((item) => ({
      created_at: new Date(item.created_at),
      anthropometric: {
        weight: item.weight,
        muscleMass: item.muscle_mass,
        boneMass: item.bone_mass,
        bodyMass: item.fat_mass,
      },
    }));
  };

  const fetchAnthropometricData = async () => {
    try {
      const response = await axiosInstance.get(
        `/users/${userId}/anthropometrics/`
      );
      const data = response.data.data;
      console.log("Anthropometric data fetched: ", data);
      setAnthropometricData(mapAnthropometricData(data));
    } catch (error) {
      console.error("Error fetching anthropometric data: ", error);
    }
  };

  const fetchAnthropometricDataInRange = async (start: number, end: number) => {
    try {
      const response = await axiosInstance.get(
        `/users/${userId}/anthropometrics/?startDate=${start}&endDate=${end}`
      );
      const data = response.data.data;
      setAnthropometricData(mapAnthropometricData(data));
      console.log("Anthropometric data fetched in range: ", data);
    } catch (error) {
      console.error("Error fetching anthropometric data in range: ", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAnthropometricData();
      fetchObjectiveData();
    }, [])
  );
  return (
    <View style={styles.screenContainer}>
      <Header title="Estadísticas" showBack={false} />
      {/* <View style={styles.dateInputsContainer}>
        <TextInput
          label="Fecha de inicio"
          placeholder="YYYY-MM-DD"
          value={startDate}
          onChangeText={setStartDate}
          style={styles.dateInput}
        />
        <TextInput
          label="Fecha de fin"
          placeholder="YYYY-MM-DD"
          value={endDate}
          onChangeText={setEndDate}
          style={styles.dateInput}
        />
        <IconButton
          mode="contained"
          icon="magnify"
          onPress={handleSearch}
          style={styles.searchButton}
          iconColor="#F0F0F0"
        />
      </View> */}
      <ScrollView contentContainerStyle={{ gap: 20 }}>
        <LineChart
          title="Masa Muscular"
          series={muscleMassSeries}
          width={350}
          height={220}
          renderXLabel={(x) =>
            new Date(x).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "short",
            })
          }
          yLabel="%"
          showAllXLabels={false}
          showAllYLabels={false}
          xLabelSteps={5}
        />
        <LineChart
          title="Peso"
          series={weightSeries}
          width={350}
          height={220}
          renderXLabel={(x) =>
            new Date(x).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "short",
            })
          }
          yLabel="kg"
          xLabelSteps={5}
          showAllXLabels={false}
          showAllYLabels={false}
        />
        <LineChart
          title="Masa Ósea"
          series={boneMassSeries}
          width={350}
          height={220}
          renderXLabel={(x) =>
            new Date(x).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "short",
            })
          }
          yLabel="%"
        />
        <LineChart
          title="Porcentaje Graso"
          series={fatMassSeries}
          width={350}
          height={220}
          renderXLabel={(x) =>
            new Date(x).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "short",
            })
          }
          yLabel="%"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    gap: 20,
  },
  dateInputsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  dateInput: {
    backgroundColor: "#F0F0F0",
    flex: 1,
  },
  searchButton: {
    alignSelf: "center",
    backgroundColor: "#287D76",
  },
});
