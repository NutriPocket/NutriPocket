import { useAtom } from "jotai";
import { useCallback, useState } from "react";
import { authenticatedAtom } from "@/atoms/authAtom";
import { Text, View, ScrollView, StyleSheet } from "react-native";
import {
  FAB,
  ActivityIndicator,
  SegmentedButtons,
  Chip,
} from "react-native-paper";

import Header from "@/components/Header";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import useAxiosInstance from "@/hooks/useAxios";
import { UserType } from "@/types/userType";
import { GroupType } from "@/types/groupType";
import { TouchableOpacity } from "react-native";

export default function Group() {
  const { id: paramId } = useLocalSearchParams();
  const id = paramId as string;

  const [participants, setParticipants] = useState<UserType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<GroupType | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const router = useRouter();

  const [auth] = useAtom(authenticatedAtom);

  const axiosGroupInstance = useAxiosInstance("group");
  const axiosUserInstance = useAxiosInstance("users");

  const fetchGroup = async () => {
    try {
      const response = await axiosGroupInstance.get(`/groups/${id}`);
      setGroup(response.data.data as GroupType);
    } catch {
      setGroup(null);
    }
  };

  const fetchGroupParticipants = async () => {
    const userId = auth?.id;
    if (!userId || !auth?.token) return;
    setLoading(true);
    try {
      const participantsReponse = await axiosGroupInstance.get(
        `/groups/${id}/users`,
      );
      const participantIds = participantsReponse.data.data.map(
        (user: { user_id: string }) => user.user_id,
      );

      const userResponse = await axiosUserInstance.get("/users");
      const filteredUsers = userResponse.data.filter(
        (user: UserType) =>
          participantIds.includes(user.id) || user.id === userId,
      );

      let orderedUsers = filteredUsers;
      if (group && group.owner_id) {
        orderedUsers = [
          ...filteredUsers.filter((p: UserType) => p.id === group.owner_id),
          ...filteredUsers.filter((p: UserType) => p.id !== group.owner_id),
        ];
      }

      setParticipants(orderedUsers);
      setError(null);
    } catch {
      setError("Error al obtener los grupos");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGroup();
      fetchGroupParticipants();
    }, [id, auth]),
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

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator animating={true} color="#287D76" size="large" />
        </View>
      ) : (
        <View style={styles.screenContainer}>
          <View>
            {group && (
              <View style={styles.groupInfoContainer}>
                <Text style={styles.groupTitle}>{group.name}</Text>
                <Text style={styles.groupDescription}>
                  {group.description || "Sin descripción"}
                </Text>
                <Text style={styles.groupDate}>
                  Creado el {new Date(group.created_at).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
          {/* Tabs con SegmentedButtons */}
          <SegmentedButtons
            value={tabIndex.toString()}
            onValueChange={(v) => setTabIndex(Number(v))}
            buttons={[
              { value: "0", label: "Participantes" },
              { value: "1", label: "Rutinas" },
            ]}
            style={{ marginBottom: 16 }}
            theme={{
              colors: {
                secondaryContainer: "#287D76",
                onSecondaryContainer: "#fff",
                surfaceVariant: "#E0F2F1",
                onSurfaceVariant: "#287D76",
              },
            }}
          />
          {/* Contenido según tab seleccionado */}
          {tabIndex === 0 ? (
            <View style={{ flex: 1 }}>
              <Text style={styles.error}>{error}</Text>
              <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
              >
                {participants.length > 0 ? (
                  participants.map((participant) => (
                    <TouchableOpacity
                      key={participant.id}
                      style={styles.userCard}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.userName}>
                            {participant.username}
                          </Text>
                          <Text style={styles.userEmail}>
                            {participant.email}
                          </Text>
                        </View>
                        {group && participant.id === group.owner_id && (
                          <Chip
                            mode="outlined"
                            style={{ borderColor: "#287D76", marginLeft: 8 }}
                            textStyle={{ color: "#287D76", fontWeight: "bold" }}
                            compact
                          >
                            Creador
                          </Chip>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noParticipantsText}>
                    No hay participantes
                  </Text>
                )}
              </ScrollView>
              <FAB
                icon="plus"
                label="Añadir Participante"
                style={styles.fab}
                color="#fff"
                onPress={() => {
                  router.push({
                    pathname: "/groups/[id]/addParticipant",
                    params: { id: id },
                  });
                }}
              />
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              {group && group.routines && group.routines.length > 0 ? (
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                  {Array.from(
                    group.routines.reduce((acc, routine) => {
                      if (!acc.has(routine.day)) acc.set(routine.day, []);
                      acc.get(routine.day)!.push(routine);
                      return acc;
                    }, new Map<string, typeof group.routines>()),
                  )
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([day, routines]) => (
                      <View key={day} style={{ marginBottom: 16 }}>
                        <Text
                          style={{
                            fontWeight: "bold",
                            fontSize: 18,
                            color: "#287D76",
                            marginBottom: 8,
                          }}
                        >
                          {dayMap[day] || day}
                        </Text>
                        {routines.map((routine, idx) => (
                          <View key={idx} style={styles.userCard}>
                            <Text style={styles.userName}>{routine.name}</Text>
                            <Text style={styles.userEmail}>
                              {routine.description}
                            </Text>
                            <Text style={styles.userEmail}>
                              Horario: {routine.start_hour} - {routine.end_hour}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ))}
                </ScrollView>
              ) : (
                <Text style={styles.noParticipantsText}>No hay rutinas</Text>
              )}
              <FAB
                icon="plus"
                label="Añadir Rutina"
                style={styles.fab}
                color="#fff"
                onPress={() => {
                  router.push({
                    pathname: "/groups/[id]/addRoutine",
                    params: { id: id },
                  });
                }}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    gap: 8,
  },
  userCard: {
    padding: 16,
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 14,
    color: "#555",
  },
  noParticipantsText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#287D76",
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#287D76",
  },
  groupInfoContainer: {
    marginBottom: 16,
  },
  groupTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#287D76",
    marginBottom: 8,
    textAlign: "center",
  },
  groupDescription: {
    fontSize: 16,
    color: "#555",
    marginBottom: 4,
  },
  groupDate: {
    fontSize: 14,
    color: "#888",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 8,
  },
});
