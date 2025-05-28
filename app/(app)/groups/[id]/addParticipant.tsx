import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useAtom } from "jotai";
import { useState, useEffect } from "react";
import { authenticatedAtom } from "@/atoms/authAtom";
import Header from "@/components/Header";
import useAxiosInstance from "@/hooks/useAxios";
import { useRouter, useLocalSearchParams } from "expo-router";
import { UserType } from "@/types/userType";
import { Searchbar, ActivityIndicator } from "react-native-paper";

const MILISECONDS_TO_DEBOUNCE = 1000;

export default function AddParticipant() {
  const [auth] = useAtom(authenticatedAtom);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tempSearch, setTempSearch] = useState("");
  const axiosGroupInstance = useAxiosInstance("group");
  const axiosUserInstance = useAxiosInstance("users");

  const router = useRouter();
  const { id: paramId } = useLocalSearchParams();
  const id = paramId as string;

  const [users, setUsers] = useState<UserType[]>([]);
  const [groupParticipantsIds, setGroupParticipantsIds] = useState<
    string[] | null
  >(null);
  const [loading, setLoading] = useState(true);

  const fetchGroupParticipants = async () => {
    if (!id) return;

    try {
      const response = await axiosGroupInstance.get(`/groups/${id}/users`);
      const participants = response.data.data.map(
        (user: { user_id: string }) => user.user_id,
      );
      setGroupParticipantsIds(participants);
    } catch (error) {
      console.error("Error fetching group participants:", error);
    }
  };

  const fetchUsers = async () => {
    const userId = auth?.id;
    if (!userId || !auth?.token || !id || !groupParticipantsIds) return;
    setLoading(true);

    try {
      const route = search ? `/users/?searchUsername=${search}` : "/users/";

      const userResponse = await axiosUserInstance.get(route);

      const filteredUsers = userResponse.data.filter(
        (user: UserType) => !groupParticipantsIds.includes(user.id),
      );

      setUsers(filteredUsers);
      setError(null);
    } catch (error) {
      setError("Error al obtener los usuarios");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, groupParticipantsIds]);

  useEffect(() => {
    fetchGroupParticipants();
  }, [id]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (tempSearch !== search) {
        setSearch(tempSearch);
      }
    }, MILISECONDS_TO_DEBOUNCE);

    return () => {
      clearTimeout(handler);
    };
  }, [tempSearch]);

  const handleAddParticipant = async (newParticipantId: string) => {
    try {
      const userId = auth?.id;
      if (!userId || !auth?.token) return;

      await axiosGroupInstance.post(
        `/groups/${id}/users/${newParticipantId}`,
        {},
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

        <Searchbar
          placeholder="Buscar por nombre o email"
          value={tempSearch}
          onChangeText={setTempSearch}
          onIconPress={() => setSearch(tempSearch)}
          style={{ backgroundColor: "#F5F5F5" }}
          inputStyle={{ fontSize: 16 }}
        />

        {error && <Text style={styles.error}>{error}</Text>}
        {loading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <ActivityIndicator animating={true} color="#287D76" size="large" />
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(user) => user.id}
            renderItem={({ item: user }) => (
              <TouchableOpacity
                style={styles.userCard}
                onPress={() => handleAddParticipant(user.id)}
              >
                <Text style={styles.userName}>{user.username}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{
              paddingBottom: 20,
              gap: 10,
            }}
            ListEmptyComponent={
              <Text style={{ textAlign: "center", marginTop: 20 }}>
                No hay usuarios disponibles
              </Text>
            }
          />
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
