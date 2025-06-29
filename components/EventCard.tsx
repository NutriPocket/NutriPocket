import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { FAB, Button } from "react-native-paper";
import { useRouter } from "expo-router";
import { GroupType } from "@/types/groupType";
import { UserType } from "@/types/userType";
import useAxiosInstance from "@/hooks/useAxios";

interface Props {
  group: GroupType | null;
  participants: Array<UserType>;
  events: Array<{
    id: string;
    name: string;
    description: string;
    date: string; // ISO date string
    start_hour: number;
    end_hour: number;
    creator_id: string;
  }>;
}

type RoutineType = {
  day: string;
  name: string;
  description: string;
  start_hour: number;
  end_hour: number;
  creator_id?: string;
  isRoutine: true;
  date: string;
};

type OneTimeEventType = Props["events"][number] & { isRoutine: false };

type AllEventType = OneTimeEventType | RoutineType;

type EventCardProps = {
  event: AllEventType;
  groupId?: string;
  participants: Array<UserType>;
  router: ReturnType<typeof useRouter>;
};

const EventCard = ({
  event,
  groupId,
  participants,
  router,
}: EventCardProps) => {
  const creator =
    event.creator_id && participants.find((p) => p.id === event.creator_id);

  // Only one-time events have an id property
  const eventId = "id" in event ? event.id : undefined;
  console.log(event);
  return (
    <TouchableOpacity
      activeOpacity={event.isRoutine ? 1 : 0.7}
      disabled={event.isRoutine}
      onPress={() => {
        if (!event.isRoutine && eventId) {
          router.push({
            pathname: "/groups/[id]/eventDetails",
            params: { id: groupId ?? "", eventId: eventId ?? "" },
          });
        }
      }}
      style={[
        styles.userCard,
        event.isRoutine ? styles.routineCard : styles.eventCard,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={styles.userName}>{event.name} </Text>
        {event.isRoutine ? (
          <View style={styles.routineTag}>
            <Text style={{ color: "#1565C0", fontSize: 12 }}>Rutina</Text>
          </View>
        ) : (
          <View style={styles.eventTag}>
            <Text style={{ color: "#2E7D32", fontSize: 12 }}>Evento</Text>
          </View>
        )}
      </View>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "normal",
          color: "#555",
          marginTop: 6,
        }}
      >
        {`${event.start_hour.toString().padStart(2, "0")}:00-${event.end_hour
          .toString()
          .padStart(2, "0")}:00hs`}
      </Text>
      {creator && (
        <Text style={styles.creatorId}>Creador: {creator.email}</Text>
      )}
    </TouchableOpacity>
  );
};

export default EventCard;

export const RoutinesTab: React.FC<Props> = ({
  group,
  participants,
  events: eventsFromProps,
}) => {
  const router = useRouter();
  const axiosInstance = useAxiosInstance("group");
  const [fetchedEvents, setFetchedEvents] = useState<Props["events"]>([]);
  const [isFabOpen, setIsFabOpen] = useState(false);

  useEffect(() => {
    if (group?.id) {
      axiosInstance
        .get(`/groups/${group.id}/events`)
        .then((res) => {
          setFetchedEvents(res.data.data);
        })
        .catch((err) => {
          // handle error as needed
        });
    }
  }, [group?.id]);
  const dayMap: Record<string, string> = {
    Monday: "Lunes",
    Tuesday: "Martes",
    Wednesday: "Miércoles",
    Thursday: "Jueves",
    Friday: "Viernes",
    Saturday: "Sábado",
    Sunday: "Domingo",
  };

  const getNextDateForDay = (day: string) => {
    const weekDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const englishDay =
      Object.entries(dayMap).find(([eng, spa]) => spa === day)?.[0] || day;

    const today = new Date();
    const todayIdx = today.getDay();
    const targetIdx = weekDays.indexOf(englishDay);

    // If day not found, return today's date
    if (targetIdx === -1) {
      console.warn(`Invalid day name: ${day}`);
      return today.toISOString().split("T")[0];
    }

    let diff = targetIdx - todayIdx;
    if (diff < 0) diff += 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + diff);
    return nextDate.toISOString().split("T")[0];
  };

  const routineEvents: RoutineType[] =
    group?.routines?.map((routine) => ({
      ...routine,
      date: getNextDateForDay(routine.day),
      isRoutine: true,
    })) || [];

  const eventsToUse =
    fetchedEvents.length > 0 ? fetchedEvents : eventsFromProps || [];
  const oneTimeEvents: OneTimeEventType[] = eventsToUse.map((event) => ({
    ...event,
    isRoutine: false,
  }));

  const allEvents: AllEventType[] = [...oneTimeEvents, ...routineEvents];
  const grouped = allEvents.reduce((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, AllEventType[]>);

  const sortedDates = Object.keys(grouped).sort();

  return (
    <View style={{ flex: 1 }}>
      {sortedDates.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {sortedDates.map((date, idx) => {
            const formattedDate = new Date(date);
            const displayDate = formattedDate.toLocaleDateString("es-ES", {
              weekday: "long",
              month: "long",
              day: "numeric",
            });

            return (
              <View key={`${date}${idx}`} style={{ marginBottom: 16, gap: 8 }}>
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 18,
                    color: "#287D76",
                    marginBottom: 8,
                  }}
                >
                  {displayDate}
                </Text>
                {grouped[date].map((event) => (
                  <EventCard
                    key={
                      event.isRoutine
                        ? `routine-${event.name}-${event.day}`
                        : `event-${event.id}`
                    }
                    event={event}
                    groupId={group?.id}
                    participants={participants}
                    router={router}
                  />
                ))}
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <Text style={styles.noParticipantsText}>No hay eventos ni rutinas</Text>
      )}
      <FAB.Group
        open={isFabOpen}
        visible={true}
        icon={isFabOpen ? "close" : "plus"}
        actions={[
          {
            icon: "plus",
            label: "Añadir Evento",
            onPress: () => {
              if (group?.id) {
                router.push({
                  pathname: "/groups/[id]/addEvent",
                  params: { id: group.id },
                });
              }
            },
          },
          {
            icon: "plus",
            label: "Añadir Rutina",
            onPress: () => {
              if (group?.id) {
                router.push({
                  pathname: "/groups/[id]/addRoutine",
                  params: { id: group.id },
                });
              }
            },
          },
        ]}
        onStateChange={({ open }) => setIsFabOpen(open)}
        fabStyle={{ backgroundColor: "#287D76" }}
        color="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    gap: 16,
    padding: 16,
  },
  userCard: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
  },
  eventCard: {
    backgroundColor: "#E8F5E9",
  },
  routineCard: {
    backgroundColor: "#E3F2FD",
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
    textAlign: "center",
    marginTop: 40,
  },
  routineTag: {
    fontSize: 12,
    color: "#1565C0",
    backgroundColor: "#BBDEFB",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
    marginLeft: 6,
  },
  eventTag: {
    fontSize: 12,
    color: "#2E7D32",
    backgroundColor: "#C8E6C9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
    marginLeft: 6,
  },
  detailsButton: {
    backgroundColor: "#287D76",
    height: 28,
    alignSelf: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
  },
  fab: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#287D76",
  },
  fabEvent: {
    position: "absolute",
    bottom: 80,
    right: 16,
    backgroundColor: "#287D76",
  },
});
