import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { FAB, ActivityIndicator } from "react-native-paper";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { RoutineType } from "../../../types/routineType";
import useAxiosInstance from "@/hooks/useAxios";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

export default function UserRoutinesSection() {
  const [auth] = useAtom(authenticatedAtom);
  const [routines, setRoutines] = useState<RoutineType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock del servicio de usuarios - aquí conectarías con el backend real
  const axiosUser = useAxiosInstance("users");
  const axiosProgress = useAxiosInstance("progress");

  const fetchRoutines = async () => {
    try {
      setLoading(true);
      const userId = auth?.id;

      if (!userId || !auth?.token) {
        setLoading(false);
        return;
      }
      console.log("Fetching routines for user ID: ", userId);
      const response = await axiosProgress.get(`/users/${userId}/routines/`);
      console.log("Routines fetched: ", response.data.data);
      setRoutines(response.data.data);

      // Mock de rutinas - reemplaza esto con la llamada real al backend
      // const response = await axiosUser.get(`/users/${userId}/routines/`);
      // setRoutines(response.data.data);

      // Datos mock mientras implementas el backend
      // const mockRoutines: RoutineType[] = [
      //   {
      //     name: "Rutina de Fuerza",
      //     description: "Entrenamiento de fuerza con pesas",
      //     day: "Monday",
      //     start_hour: 8,
      //     end_hour: 10,
      //   },
      //   {
      //     name: "Cardio Matutino",
      //     description: "Ejercicio cardiovascular intenso",
      //     day: "Wednesday",
      //     start_hour: 7,
      //     end_hour: 8,
      //   },
      //   {
      //     name: "Yoga y Estiramiento",
      //     description: "Relajación y flexibilidad",
      //     day: "Friday",
      //     start_hour: 18,
      //     end_hour: 19,
      //   },
      // ];

      // Simular delay de red
      //await new Promise((resolve) => setTimeout(resolve, 1000));
      //setRoutines(mockRoutines);
      setError(null);
    } catch (err) {
      console.log("Error fetching routines: ", err);
      setError("No se pudieron obtener las rutinas.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (auth?.id && auth?.token) {
        fetchRoutines();
      }
    }, [auth?.id, auth?.token])
  );

  const dayMap: Record<string, string> = {
    Monday: "Lunes",
    Tuesday: "Martes",
    Wednesday: "Miércoles",
    Thursday: "Jueves",
    Friday: "Viernes",
    Saturday: "Sábado",
    Sunday: "Domingo",
  };

  const handleAddRoutine = () => {
    router.push("/user/addRoutine");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} color="#287D76" size="large" />
        <Text style={styles.loadingText}>Cargando rutinas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {routines.length > 0 ? (
          Array.from(
            routines.reduce((acc, routine) => {
              if (!acc.has(routine.day)) acc.set(routine.day, []);
              acc.get(routine.day)!.push(routine);
              return acc;
            }, new Map<string, RoutineType[]>())
          )
            // Ordenar por día de la semana
            .sort(([a], [b]) => {
              const weekOrder = [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ];
              return weekOrder.indexOf(a) - weekOrder.indexOf(b);
            })
            .map(([day, dayRoutines]) => (
              <View key={day} style={styles.daySection}>
                <Text style={styles.dayTitle}>{dayMap[day] || day}</Text>
                {dayRoutines.map((routine, idx) => (
                  <TouchableOpacity key={idx} style={styles.routineCard}>
                    <Text style={styles.routineName}>{routine.name}</Text>
                    <Text style={styles.routineDescription}>
                      {routine.description}
                    </Text>
                    <Text style={styles.routineTime}>
                      Horario: {routine.start_hour}:00 - {routine.end_hour}:00
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes rutinas asignadas</Text>
            <Text style={styles.emptySubtext}>
              Agrega tu primera rutina para comenzar
            </Text>
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        label="Agregar Rutina"
        style={styles.fab}
        color="#fff"
        onPress={handleAddRoutine}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#555",
  },
  scrollContainer: {
    padding: 16,
    gap: 16,
  },
  daySection: {
    marginBottom: 16,
    gap: 8,
  },
  dayTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#287D76",
    marginBottom: 8,
  },
  routineCard: {
    padding: 16,
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    marginBottom: 8,
  },
  routineName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#287D76",
    marginBottom: 4,
  },
  routineDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  routineTime: {
    fontSize: 13,
    color: "#888",
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#287D76",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    margin: 16,
    fontSize: 14,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#287D76",
  },
});
