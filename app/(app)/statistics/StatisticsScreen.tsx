import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, IconButton } from "react-native-paper";
import Header from "@/components/Header";
import LineChart, { LineChartSeries } from "@/components/LineChart";
import useAxiosInstance from "@/hooks/useAxios";
import { useAtom } from "jotai";
import { authenticatedAtom } from "@/atoms/authAtom";
import { AnthropometricType, ObjectiveType } from "@/types/anthropometricTypes";

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
      date: Date;
      anthropometric: AnthropometricType;
    }[]
  >([]);

  // const muscleMassSeries: LineChartSeries[] = [
  //   {
  //     label: "Masa Muscular",
  //     color: "#287D76",
  //     data: anthropometricData.map(({ date, anthropometric }) => ({
  //       x: new Date(date).getTime(),
  //       y: Number(anthropometric.muscleMass),
  //     })),
  //     showPoints: true,
  //   },
  //   {
  //     label: "Objetivo",
  //     color: "#FF0000",
  //     data: anthropometricData.map(({ date, anthropometric }) => ({
  //       x: new Date(date).getTime(),
  //       y: Number(anthropometric.muscleMass),
  //     })),
  //     strokeDasharray: "6 6",
  //   },
  // ];

  const weightSeries: LineChartSeries[] = [
    {
      label: "Peso",
      color: "#287D76",
      data: [
        { x: new Date("2025-06-01").getTime(), y: 70 },
        { x: new Date("2025-06-15").getTime(), y: 72 },
        { x: new Date("2025-06-30").getTime(), y: 74 },
      ],
      showPoints: true,
    },
    {
      label: "Objetivo",
      color: "#FF0000",
      data: [
        { x: new Date("2025-06-01").getTime(), y: 75 },
        { x: new Date("2025-06-30").getTime(), y: 75 },
      ],
      strokeDasharray: "6 6",
    },
  ];

  const boneMassSeries: LineChartSeries[] = [
    {
      label: "Masa Ósea",
      color: "#287D76",
      data: [
        { x: new Date("2025-06-01").getTime(), y: 12 },
        { x: new Date("2025-06-15").getTime(), y: 13 },
        { x: new Date("2025-06-30").getTime(), y: 14 },
      ],
      showPoints: true,
    },
    {
      label: "Objetivo",
      color: "#FF0000",
      data: [
        { x: new Date("2025-06-01").getTime(), y: 15 },
        { x: new Date("2025-06-30").getTime(), y: 15 },
      ],
      strokeDasharray: "6 6",
    },
  ];

  const fatMassSeries: LineChartSeries[] = [
    {
      label: "Porcentaje Graso",
      color: "#287D76",
      data: [
        { x: new Date("2025-06-01").getTime(), y: 25 },
        { x: new Date("2025-06-15").getTime(), y: 23 },
        { x: new Date("2025-06-30").getTime(), y: 20 },
      ],
      showPoints: true,
    },
    {
      label: "Objetivo",
      color: "#FF0000",
      data: [
        { x: new Date("2025-06-01").getTime(), y: 18 },
        { x: new Date("2025-06-30").getTime(), y: 18 },
      ],
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

    console.log("Fetching data from", start, "to", end);
    fetchAnthropometricDataInRange(start, end);
  };

  const fetchAnthropometricData = async () => {
    try {
      const response = await axiosInstance.get(
        `/users/${auth?.id}/anthropometrics/`
      );
      const data = response.data.data;
      setObjectiveData(data);
      console.log("Anthropometric data fetched: ", data);
    } catch (error) {
      console.error("Error fetching anthropometric data: ", error);
    }
  };

  const fetchAnthropometricDataInRange = async (start: number, end: number) => {
    try {
      const response = await axiosInstance.get(
        `/users/${auth?.id}/anthropometrics/?startDate=${start}&endDate=${end}`
      );
      const data = response.data.data;
      setAnthropometricData(data);
      console.log("Anthropometric data fetched in range: ", data);
    } catch (error) {
      console.error("Error fetching anthropometric data in range: ", error);
    }
  };

  useEffect(() => {
    fetchAnthropometricData();
  }, [auth?.id]);

  return (
    <ScrollView
      contentContainerStyle={styles.screenContainer}
      style={{ flex: 1 }}
    >
      <Header title="Estadísticas" showBack={false} />

      <View style={styles.dateInputsContainer}>
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
        />
      </View>

      {/* <LineChart
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
      /> */}

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
    flex: 1,
  },
  searchButton: {
    alignSelf: "center",
    backgroundColor: "#287D76",
  },
});
