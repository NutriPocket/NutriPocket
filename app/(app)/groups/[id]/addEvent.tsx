import React, { useState } from "react";
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from "react-native";
import { Formik } from "formik";
import { TextInput, Button } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import useAxiosInstance from "@/hooks/useAxios";
import OptionPicker from "@/components/OptionPicker";
import Header from "@/components/Header";
import { useAtom } from "jotai";
import { authenticatedAtom } from "@/atoms/authAtom";

const hours = Array.from({ length: 24 }, (_, i) => ({
    label: `${i}:00`,
    value: i.toString(),
}));

export default function AddEvent() {
    const { id: groupId, defaultValues: defaultValuesParam } = useLocalSearchParams();
    let defaultValues: Partial<{
        name: string;
        description: string;
        date: string;
        start_hour: string;
        end_hour: string;
        id?: string;
        poll?: {
            question: string;
            options: Array<{ id: number; text: string }>;
        };
    }> = {};
    console.log("default", defaultValuesParam);
    if (defaultValuesParam) {
        try {
            const parsed = JSON.parse(defaultValuesParam as string);
            defaultValues = parsed.data ? parsed.data : parsed;
            if (parsed.data?.poll || parsed.poll) {
                defaultValues.poll = parsed.data?.poll ?? parsed.poll;
            }
        } catch {
            defaultValues = {};
        }
    }
    console.log(defaultValues);
    const router = useRouter();
    const axiosInstance = useAxiosInstance("group");

    const [auth] = useAtom(authenticatedAtom);
    const creatorId = auth?.id;

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const isEdit = !!defaultValues.id;

    return (
        <ScrollView style={{ flex: 1 }}>
            <Header />
            <View style={styles.container}>
                <Text style={styles.title}>
                    {isEdit ? "Editar Evento" : "Crear Evento"}
                </Text>
                <Formik
                    key={defaultValues?.id ?? "new"}
                    initialValues={{
                        name: defaultValues?.name ?? "",
                        description: defaultValues?.description ?? "",
                        date: defaultValues?.date ?? "",
                        start_hour: defaultValues?.start_hour?.toString() ?? "",
                        end_hour: defaultValues?.end_hour?.toString() ?? "",
                        poll_question: defaultValues?.poll?.question ?? "",
                        poll_options: defaultValues?.poll?.options?.map((o: any) => o.text) ?? [""],
                    }}
                    onSubmit={async (values, { setSubmitting, setFieldError }) => {
                            if (!values.date) {
                                setFieldError("date", "Por favor selecciona una fecha.");
                            setSubmitting(false);
                            return;
                        }

                        const start = parseInt(values.start_hour, 10);
                        const end = parseInt(values.end_hour, 10);

                        if (isNaN(start) || isNaN(end) || start >= end) {
                            setFieldError(
                                "start_hour",
                                "Por favor selecciona un rango horario válido."
                            );
                            setSubmitting(false);
                            return;
                        }

                        try {
                            const poll =
                                values.poll_question && values.poll_options.filter((text: string) => text.trim() !== "").length > 0
                                    ? {
                                        question: values.poll_question,
                                        options: values.poll_options
                                            .filter((text: string) => text.trim() !== "")
                                            .map((text: string, idx: number) => ({
                                              id: idx + 1,
                                              text,
                                          })),
                                      }
                                    : undefined;

                            const payload = {
                                ...values,
                                date: values.date,
                                start_hour: start,
                                end_hour: end,
                                creator_id: creatorId,
                                poll,
                            };
                            console.log("Payload:", payload);

                            if (isEdit && defaultValues?.id) {
                                await axiosInstance.patch(
                                    `/groups/${groupId}/events/${defaultValues.id}`,
                                    payload
                                );
                            } else {
                                // Create event
                                await axiosInstance.post(
                                    `/groups/${groupId}/events`,
                                    payload
                                );
                            }
                            router.back();
                        } catch (error) {
                            const axiosError = error as any;
                            setErrorMessage(
                                axiosError.response?.status === 409
                                    ? "No se puede añadir la rutina ya que interfiere con las rutinas de los miembros."
                                    : axiosError.response?.status === 422
                                        ? axiosError.response.data.message
                                        : "Ocurrió un error al añadir la rutina. Por favor, inténtalo nuevamente."
                            );
                            console.log(error);
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {(formikProps) => (
                        <View style={styles.form}>
                            <TextInput
                                label="Nombre"
                                value={formikProps.values.name}
                                onChangeText={formikProps.handleChange("name")}
                                onBlur={formikProps.handleBlur("name")}
                                style={styles.input}
                                placeholder={defaultValues?.name ?? ""}
                            />
                            <TextInput
                                label="Descripción"
                                value={formikProps.values.description}
                                onChangeText={formikProps.handleChange("description")}
                                onBlur={formikProps.handleBlur("description")}
                                style={styles.input}
                                placeholder={defaultValues?.description ?? ""}
                            />
                            <TextInput
                                label="Fecha"
                                value={formikProps.values.date ? formikProps.values.date.split("T")[0] : ""}
                                onChangeText={formikProps.handleChange("date")}
                                onBlur={formikProps.handleBlur("date")}
                                style={styles.input}
                                placeholder="YYYY-MM-DD"
                            />
                            <View style={styles.pickerContainer}>
                                <View style={styles.picker}>
                                    <OptionPicker
                                        label="Desde"
                                        value={formikProps.values.start_hour}
                                        items={hours}
                                        setValue={(value: string) => formikProps.setFieldValue("start_hour", value)}
                                    />
                                </View>
                                <Text style={styles.separator}>a</Text>
                                <View style={styles.picker}>
                                    <OptionPicker
                                        label="Hasta"
                                        value={formikProps.values.end_hour}
                                        items={hours}
                                        setValue={(value: string) => formikProps.setFieldValue("end_hour", value)}
                                    />
                                </View>
                            </View>
                            {formikProps.errors.date && <Text style={styles.errorText}>{formikProps.errors.date}</Text>}
                            {formikProps.errors.start_hour && (
                                <Text style={styles.errorText}>{formikProps.errors.start_hour}</Text>
                            )}

                            {!isEdit && (
                            <View style={styles.pollContainer}>
                                <Text style={styles.pollTitle}>Votar Menu</Text>
                                <TextInput
                                    label="Pregunta de la encuesta"
                                    value={formikProps.values.poll_question}
                                    onChangeText={formikProps.handleChange("poll_question")}
                                    style={styles.input}
                                />
                                {formikProps.values.poll_options.map((option: string, idx: number) => (
                                    <View key={idx} style={[styles.pollOptionRow, { flexDirection: "row", alignItems: "center", gap: 6 }]}>
                                        <TextInput
                                            value={option}
                                            onChangeText={text => {
                                                const newOptions = [...formikProps.values.poll_options];
                                                newOptions[idx] = text;
                                                formikProps.setFieldValue("poll_options", newOptions);
                                            }}
                                            style={[styles.input, { flex: 1, minWidth: 0 }]}
                                            placeholder={`Opción ${idx + 1}`}
                                            dense
                                        />
                                        <Button
                                            mode="text"
                                            onPress={() => {
                                                const newOptions = formikProps.values.poll_options.filter((_: string, i: number) => i !== idx);
                                                formikProps.setFieldValue("poll_options", newOptions.length ? newOptions : [""]);
                                            }}
                                            disabled={formikProps.values.poll_options.length === 1}
                                            compact
                                        >
                                            ×
                                        </Button>
                                    </View>
                                ))}
                                <TouchableOpacity
                                    onPress={() => formikProps.setFieldValue("poll_options", [...formikProps.values.poll_options, ""])}
                                    style={[styles.addOptionButton, { padding: 10, backgroundColor: "#e0e0e0", borderRadius: 8 }]}
                                    activeOpacity={0.7}
                                >
                                    <Text style={{ color: "#287D76", fontWeight: "bold" }}>Añadir opción</Text>
                                </TouchableOpacity>
                            </View>
                            )}

                            <Button
                                mode="contained"
                                onPress={formikProps.handleSubmit as any}
                                loading={formikProps.isSubmitting}
                                disabled={formikProps.isSubmitting}
                                style={styles.button}
                            >
                                {isEdit ? "Guardar Cambios" : "Guardar"}
                            </Button>
                            {errorMessage && (
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            )}
                        </View>
                    )}
                </Formik>
            </View>
        </ScrollView>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f4f4f4",
    },
    form: {
        gap: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#287D76",
        marginBottom: 30,
        textAlign: "center",
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 8,
    },
    button: {
        marginTop: 10,
        backgroundColor: "#287D76",
        borderRadius: 8,
    },
    pickerContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
    },
    picker: {
        flex: 1,
    },
    separator: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#555",
    },
    errorText: {
        color: "red",
        fontSize: 14,
        textAlign: "center",
    },
    pollContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: "#fff",
        borderRadius: 8,
        gap: 10,
    },
    pollTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#287D76",
        marginBottom: 10,
    },
    pollOptionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    addOptionButton: {
        marginTop: 5,
        alignSelf: "flex-start",
    },
});
