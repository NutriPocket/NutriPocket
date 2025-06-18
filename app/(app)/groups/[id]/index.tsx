import { useAtom } from "jotai";
import { useCallback, useState } from "react";
import { authenticatedAtom } from "@/atoms/authAtom";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import useAxiosInstance from "@/hooks/useAxios";
import { UserType } from "@/types/userType";
import { GroupType } from "@/types/groupType";

import { ParticipantsTab } from "./ParticipantsTab";
import { RoutinesTab } from "./RoutinesTab";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { SegmentedButtons } from "react-native-paper";
import Header from "@/components/Header";

export default function Group() {
  const { id: paramId } = useLocalSearchParams();
  const id = paramId as string;

  const [participants, setParticipants] = useState<UserType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<GroupType | null>(null);
  const [tabIndex, setTabIndex] = useState(0);

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
        `/groups/${id}/users`
      );
      const participantIds = participantsReponse.data.data.map(
        (user: { user_id: string }) => user.user_id
      );

      const userResponse = await axiosUserInstance.get("/users/");
      const filteredUsers = userResponse.data.filter(
        (user: UserType) =>
          participantIds.includes(user.id) || user.id === userId
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
    }, [id, auth])
  );

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
          <SegmentedButtons
            value={tabIndex.toString()}
            onValueChange={(v) => setTabIndex(Number(v))}
            buttons={[
              { value: "0", label: "Participantes" },
              { value: "1", label: "Rutinas" },
            ]}
            theme={{
              colors: {
                secondaryContainer: "#287D76",
                onSecondaryContainer: "#fff",
                surfaceVariant: "#E0F2F1",
                onSurfaceVariant: "#287D76",
              },
            }}
          />
          {tabIndex === 0 ? (
            <ParticipantsTab
              participants={participants}
              group={group}
              error={error}
            />
          ) : (
            <RoutinesTab group={group} participants={participants} />
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
    gap: 32,
    backgroundColor: "#fff",
  },
  groupInfoContainer: {
    gap: 8,
  },
  groupTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#287D76",
    textAlign: "center",
  },
  groupDescription: {
    fontSize: 16,
    color: "#555",
  },
  groupDate: {
    fontSize: 14,
    color: "#999",
  },
});
