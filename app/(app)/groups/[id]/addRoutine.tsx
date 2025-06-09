import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Formik } from "formik";
import { TextInput, Button } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import useAxiosInstance from "@/hooks/useAxios";
import OptionPicker from "@/components/OptionPicker";
import Header from "@/components/Header";
import { useAtom } from "jotai";
import { authenticatedAtom } from "@/atoms/authAtom";

const daysOfWeek = [
  { label: "Lunes", value: "Monday" },
  { label: "Martes", value: "Tuesday" },
  { label: "Miércoles", value: "Wednesday" },
  { label: "Jueves", value: "Thursday" },
  { label: "Viernes", value: "Friday" },
  { label: "Sábado", value: "Saturday" },
  { label: "Domingo", value: "Sunday" },
];

const hours = Array.from({ length: 24 }, (_, i) => ({
  label: `${i}:00`,
  value: i.toString(),
}));

export default function AddRoutine() {
  const { id: groupId } = useLocalSearchParams();
  const router = useRouter();
  const [auth] = useAtom(authenticatedAtom);
  const axiosInstance = useAxiosInstance("group");

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>Añadir Rutina</Text>
        <Formik
          initialValues={{
            name: "",
            description: "",
            day: "",
            start_hour: "",
            end_hour: "",
            creator_id: "",
          }}
          onSubmit={async (values, { setSubmitting }) => {
            if (!values.day) {
              Alert.alert("Error", "Por favor selecciona un día de la semana.");
              setSubmitting(false);
              return;
            }

            const start = parseInt(values.start_hour, 10);
            const end = parseInt(values.end_hour, 10);

            if (isNaN(start) || isNaN(end) || start >= end) {
              Alert.alert(
                "Error",
                "Por favor selecciona un rango horario válido.",
              );
              setSubmitting(false);
              return;
            }

            try {
              const currentUserId = auth?.id;

              const payload = {
                ...values,
                day: values.day,
                start_hour: start,
                end_hour: end,
                creator_id: currentUserId, // Replace with actual user ID
              };
              await axiosInstance.post(
                `/groups/${groupId}/routines?force_members=false`,
                payload,
              );
              router.back();
            } catch (error) {
              console.error(error);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            isSubmitting,
          }) => (
            <View style={styles.form}>
              <TextInput
                label="Nombre"
                value={values.name}
                onChangeText={handleChange("name")}
                onBlur={handleBlur("name")}
                style={styles.input}
              />
              <TextInput
                label="Descripción"
                value={values.description}
                onChangeText={handleChange("description")}
                onBlur={handleBlur("description")}
                style={styles.input}
              />
              <OptionPicker
                label="Día de la semana"
                value={values.day}
                items={daysOfWeek}
                setValue={(value) => handleChange("day")(value)}
              />
              <View style={styles.pickerContainer}>
                <View style={styles.picker}>
                  <OptionPicker
                    label="Desde"
                    value={values.start_hour}
                    items={hours}
                    setValue={(value) => handleChange("start_hour")(value)}
                  />
                </View>
                <Text style={styles.separator}>a</Text>
                <View style={styles.picker}>
                  <OptionPicker
                    label="Hasta"
                    value={values.end_hour}
                    items={hours}
                    setValue={(value) => handleChange("end_hour")(value)}
                  />
                </View>
              </View>
              <Button
                mode="contained"
                onPress={() => handleSubmit()}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={styles.button}
              >
                Guardar
              </Button>
            </View>
          )}
        </Formik>
      </View>
    </View>
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
});
