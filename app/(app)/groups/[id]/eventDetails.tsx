import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import { View, Text, Alert, StyleSheet } from "react-native";
import {useRouter, useLocalSearchParams, useFocusEffect} from "expo-router";
import useAxiosInstance from "@/hooks/useAxios";
import {Button, Icon, TextInput} from "react-native-paper";
import { TouchableOpacity } from "react-native";

const EventDetails = () => {
    const router = useRouter();
    const { id, eventId } = useLocalSearchParams();
    const axiosInstance = useAxiosInstance("group");
    const [event, setEvent] = useState<any>(null);

    useFocusEffect(() => {
        if (id && eventId) {
            axiosInstance.get(`/groups/${id}/events/${eventId}`)
                .then(res => setEvent(res.data.data))
                .catch(() => Alert.alert("Error", "No se pudo cargar el evento"));
        }
    });

    const handleDelete = () => {
        Alert.alert(
            "Eliminar Evento",
            "¿Estás seguro de que deseas eliminar este evento?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () => {
                        axiosInstance.delete(`/groups/${id}/events/${eventId}`)
                            .then(() => {
                                Alert.alert("Eliminado", "Evento eliminado correctamente");
                                router.back();
                            })
                            .catch(() => Alert.alert("Error", "No se pudo eliminar el evento"));
                    }
                }
            ]
        );
    };

    const handleEdit = () => {
        console.log("Editando evento", event);
        router.push({
            pathname: "/(app)/groups/[id]/addEvent",
            params: {
                id: typeof id === "string" ? id : id?.[0],
                defaultValues: JSON.stringify(event),
            },
        });
    };

const handleVote = (optionId: number, pollId: number) => {
    axiosInstance.put(`/polls/${pollId}`, {
        user_id: "123e4567-e89b-12d3-a456-426614174000", // Replace with actual user id
        option_id: optionId,
        poll_id: pollId
    })
    .then(() => Alert.alert("Voto registrado", "¡Gracias por votar!"))
    .catch(() => Alert.alert("Error", "No se pudo registrar el voto"));
};
    if (!event) return <Text>Cargando...</Text>;

    return (
        <View style={styles.container}>
            <Header />
            <Text style={styles.title}>{event.name}</Text>
            <View style={styles.card}>
                <Text style={styles.subtitle}>Descripción</Text>
            <Text>{event.description}</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.subtitle}>Horario</Text>
                <Text>{event.start_hour}:00-{event.end_hour}:00hs</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.subtitle}>Votar Menu</Text>
                {event.poll ? (
                    <>
                        <Text style={{ fontWeight: "bold", marginBottom: 8 }}>{event.poll.question}</Text>
                        {event.poll.options.map((option: any) => (
                            <TouchableOpacity
                                key={option.id}
                                style={{
                                    backgroundColor: "#e0f2f1",
                                    borderRadius: 8,
                                    paddingVertical: 12,
                                    paddingHorizontal: 16,
                                    marginBottom: 8,
                                    borderWidth: 1,
                                    borderColor: "#287D76",
                                    flexDirection: "row",
                                    alignItems: "center"
                                }}
                                activeOpacity={0.7}
                                onPress={() => handleVote(option.id, event.poll.id)}
                            >
                                <Icon source="arrow-up-bold" size={20} color="#287D76" style={{ marginRight: 20 }} />
                                <Text style={{ marginLeft: 10, color: "#287D76", fontWeight: "bold", fontSize: 16 }}>
                                {option.text}
                                    <Text style={{ color: "#888", fontWeight: "normal", fontSize: 14 }}>
                                        {"  "}({event.poll.votes?.[option.id] ?? 0} votos)
                                    </Text>
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </>
                ) : (
                    <Text>No hay votacion para este evento.</Text>
                )}
            </View>
            <View style={{ flex: 1 }} />
            <View style={styles.fixedButtons}>
                <View style={{ flex: 1 }}>
                    <Button
                        mode="outlined"
                        style={{ backgroundColor: "#287D76", borderRadius: 8, marginTop: 8, borderColor: "#287D76" }}
                        textColor="#ffff"
                        onPress={handleEdit}
                    >
                        Editar
                    </Button>
                </View>
                <View style={{ flex: 1 }}>
                    <Button
                        mode="outlined"
                        style={{ borderColor: "#d32f2f", borderRadius: 8, marginTop: 8 }}
                        textColor="#d32f2f"
                        onPress={handleDelete}
                    >
                        Eliminar
                    </Button>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 24,
        paddingVertical: 24,
        gap: 16,
    },
    title: {
        fontSize: 26,
        color: "#287D76",
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 16,
    },
    card: {
        backgroundColor: "#f5f5f5",
        borderRadius: 16,
        padding: 10,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#287D76",
        textAlign: "left",
        marginBottom: 16,
    },
    button: {
        borderRadius: 8,
        paddingVertical: 10,
        marginTop: 8,
        marginBottom: 8,
        backgroundColor: "#287D76",
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    fixedButtons: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
        position: "absolute",
        left: 24,
        right: 24,
        bottom: 24,
    },
});

export default EventDetails;