import useAxiosInstance from "@/hooks/useAxios";
import { homeStyles } from "@/styles/homeStyles";
import { mealPlanListStyles } from "@/styles/mealStyles";
import { useEffect, useState } from "react";
import { Text, StyleSheet, FlatList, View } from "react-native";
import { Button, Card } from "react-native-paper";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { GroupType } from "@/types/groupTypes";


export default function GroupScreen() {
  const [auth, setIsAuthenticated] = useAtom(authenticatedAtom);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const axiosInstance = useAxiosInstance('group');

  const fetchGroups = async () => {
    try {
      const userId = auth?.id;

      if (!userId) {
        return;
      }

      if (!auth?.token) {
        return;
      }

      const response = await axiosInstance.get(`/users/${userId}/groups`);
      const fetchedGroups = response.data;

      setGroups(fetchedGroups);
      setError(null);
    } catch (error) {
      setError("Error al obtener los grupos");
    }
  }

  const handleGroupCreation = async () => {
    try {

      const userId = auth?.id;

      if (!userId) {
        return;
      }

      if (!auth?.token) {
        return;
      }

      const groupData = {
        name: "Nuevo Grupo",
        description: "Descripción del nuevo grupo",
        owner_id: userId,
      };

      console.log("groupData", groupData);

      const response = await axiosInstance.post("/groups", groupData);
      const newGroup = response.data;
      setGroups((prevGroups) => [...prevGroups, newGroup]);
      setError(null);
    } catch (error) {
      console.error("Error creating group:", error);
      setError("Error al crear el grupo");
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={homeStyles.sectionTitle}> Grupos </Text>
      <Text style={homeStyles.info}> Elegí un groupo o creá uno nuevo </Text>
      {error && <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>}

      <Button
        mode="contained"
        style={mealPlanListStyles.planButtonCreate} onPress={handleGroupCreation}
      >
        Crea un grupo
      </Button>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </Card.Content>
          </Card>
        )}

        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No hay grupos disponibles
          </Text>
        }

      />

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    marginVertical: 10,
    width: "100%",
    backgroundColor: "#f8f8f8",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: "#555",
  },
})