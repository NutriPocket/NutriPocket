import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useAtom } from "jotai";
import { useState, useEffect } from "react";
import { authenticatedAtom } from "../../../atoms/authAtom";
import Header from "../../../components/Header";
import useAxiosInstance from "@/hooks/useAxios";
import { useRouter, useLocalSearchParams } from "expo-router";
import { UserType } from "@/types/userType";

export default function AddParticipant() {
  const [auth] = useAtom(authenticatedAtom);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const axiosGroupInstance = useAxiosInstance("group");
  const axiosUserInstance = useAxiosInstance("users");

  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const userId = auth?.id;
    if (!userId || !auth?.token) return;

    try {
      console.log("Fetching users...");
      const participantsReponse = await axiosGroupInstance.get(
        `/groups/${id}/users`
      );
      const participantIds = participantsReponse.data.data.map(
        (user: { user_id: string }) => user.user_id
      );

      const userResponse = await axiosUserInstance.get("/users/");
      console.log("User response:", userResponse.data);
      const filteredUsers = userResponse.data.filter(
        (user: UserType) =>
          !participantIds.includes(user.id) && user.id !== userId
      );
      console.log("Filtered users:", filteredUsers);

      setUsers(filteredUsers);
      setError(null);
    } catch {
      setError("Error al obtener los grupos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [auth]);

  const handleAddParticipant = async (newParticipantId: string) => {
    try {
      const userId = auth?.id;
      if (!userId || !auth?.token) return;

      await axiosGroupInstance.post(
        `/groups/${id}/users/${newParticipantId}`,
        {}
      );
      router.back();
    } catch (error) {
      setError("Error al agregar participante");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />
      <View style={styles.screenContainer}>
        <Text style={styles.title}>Añadir Participante</Text>
        {error && <Text style={styles.error}>{error}</Text>}
        {loading ? (
          <Text>Cargando usuarios...</Text>
        ) : (
          <ScrollView
            contentContainerStyle={{
              paddingBottom: 20,
              gap: 10,
            }}
          >
            {users.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.userCard}
                onPress={() => handleAddParticipant(user.id)}
              >
                <Text style={styles.userName}>{user.username}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    padding: 16,
    gap: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    color: "#287D76",
    fontWeight: "bold",
    textAlign: "center",
  },
  error: {
    color: "red",
  },
  userCard: {
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    padding: 16,
  },
  userName: { fontSize: 18, fontWeight: "bold" },
  userEmail: { fontSize: 14, color: "#555" },
});
