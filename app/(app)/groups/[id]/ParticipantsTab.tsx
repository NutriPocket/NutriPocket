import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { FAB, Chip } from "react-native-paper";
import { useRouter } from "expo-router";
import { UserType } from "@/types/userType";
import { GroupType } from "@/types/groupType";

interface Props {
  participants: UserType[];
  group: GroupType | null;
  error: string | null;
}

export const ParticipantsTab: React.FC<Props> = ({
  participants,
  group,
  error,
}) => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.error}>{error}</Text>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {participants.length > 0 ? (
          participants.map((participant) => (
            <TouchableOpacity key={participant.id} style={styles.userCard}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{participant.username}</Text>
                  <Text style={styles.userText}>{participant.email}</Text>
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
          <Text style={styles.noParticipantsText}>No hay participantes</Text>
        )}
      </ScrollView>
      <FAB
        icon="plus"
        label="Añadir Participante"
        style={styles.fab}
        color="#fff"
        onPress={() => {
          if (group?.id) {
            router.push({
              pathname: "/groups/[id]/addParticipant",
              params: { id: group.id },
            });
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    gap: 16,
  },
  userCard: {
    padding: 16,
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userText: {
    fontSize: 14,
    color: "#555",
  },
  noParticipantsText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#287D76",
  },
  fab: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#287D76",
  },
  error: {
    color: "red",
    marginBottom: 8,
  },
});
