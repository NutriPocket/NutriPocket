import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { FAB } from "react-native-paper";
import { useRouter } from "expo-router";
import { GroupType } from "@/types/groupType";
import { UserType } from "@/types/userType";

interface Props {
  group: GroupType | null;
  participants: Array<UserType>;
}

export const RoutinesTab: React.FC<Props> = ({ group, participants }) => {
  const router = useRouter();

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
    <View style={{ flex: 1 }}>
      {group && group.routines && group.routines.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {Array.from(
            group.routines.reduce((acc, routine) => {
              if (!acc.has(routine.day)) acc.set(routine.day, []);
              acc.get(routine.day)!.push(routine);
              return acc;
            }, new Map<string, typeof group.routines>())
          )
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
            .map(([day, routines]) => (
              <View key={day} style={{ marginBottom: 16, gap: 8 }}>
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
                {routines.map((routine, idx) => {
                  const creator =
                    routine.creator_id &&
                    participants.find((p) => p.id === routine.creator_id);
                  return (
                    <View key={idx} style={styles.userCard}>
                      <Text style={styles.userName}>{routine.name}</Text>
                      <Text style={styles.userEmail}>
                        {routine.description}
                      </Text>
                      <Text style={styles.userEmail}>
                        Horario: {routine.start_hour} - {routine.end_hour}
                      </Text>
                      {creator && (
                        <Text style={styles.creatorId}>
                          Creador: {creator.email}
                        </Text>
                      )}
                    </View>
                  );
                })}
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
          if (group?.id) {
            router.push({
              pathname: "/groups/[id]/addRoutine",
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
  userEmail: {
    fontSize: 14,
    color: "#555",
  },
  creatorId: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    marginLeft: "auto",
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
});
