import { useAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { Text, View, ScrollView, StyleSheet } from "react-native";
import { TextInput, FAB } from "react-native-paper";

import Header from "../../../components/common/Header";
import { Formik } from "formik";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import useAxiosInstance from "@/hooks/useAxios";
import { UserType } from "@/types/userType";
import { TouchableOpacity } from "react-native";
import { homeStyles } from "@/styles/homeStyles";

export default function Group() {
  const { id } = useLocalSearchParams();
  const [participants, setParticipants] = useState<UserType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [auth] = useAtom(authenticatedAtom);

  const axiosGroupInstance = useAxiosInstance("group");
  const axiosUserInstance = useAxiosInstance("users");

  const fetchGroupParticipants = async () => {
    const userId = auth?.id;
    if (!userId || !auth?.token) return;

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

      setParticipants(filteredUsers);
      setError(null);
    } catch {
      setError("Error al obtener los grupos");
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGroupParticipants();
    }, [id, auth])
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />
      <View style={styles.screenContainer}>
        <Text style={styles.title}>Grupo</Text>
        <Text style={homeStyles.info}>Participantes</Text>
        <Text style={styles.error}>{error}</Text>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {participants.length > 0 ? (
            participants.map((participant) => (
              <TouchableOpacity key={participant.id} style={styles.userCard}>
                <Text style={styles.userName}>{participant.username}</Text>
                <Text style={styles.userEmail}>{participant.email}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noParticipantsText}>No hay participantes</Text>
          )}
        </ScrollView>
        <FAB
          icon="plus"
          style={{
            position: "absolute",
            right: 24,
            bottom: 32,
            backgroundColor: "#287D76",
          }}
          color="#fff"
          onPress={() => {
            router.push({
              pathname: "/groups/AddParticipant",
              params: { id: id },
            });
          }}
        />
      </View>
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
    gap: 20,
    paddingVertical: 50,
  },
  title: {
    fontSize: 24,
    color: "#287D76",
    fontWeight: "bold",
    textAlign: "center",
  },
  error: {
    color: "red",
    textAlign: "left",
    fontSize: 12,
    fontStyle: "italic",
  },
  noParticipantsText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#287D76",
    textAlign: "center",
  },
  userCard: {
    padding: 16,
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
  },
  info: {
    fontSize: 16,
    color: "#287D76",
    textAlign: "center",
  },
  userName: { fontSize: 18, fontWeight: "bold" },
  userEmail: { fontSize: 14, color: "#555" },
});
