import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
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
  const axiosInstance = useAxiosInstance("group");

  const [auth] = useAtom(authenticatedAtom);
  const creatorId = auth?.id;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
            force_members: "false",
          }}
          onSubmit={async (values, { setSubmitting, setFieldError }) => {
            if (!values.day) {
              setFieldError("day", "Por favor selecciona un día de la semana.");
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
              const payload = {
                ...values,
                day: values.day,
                start_hour: start,
                end_hour: end,
                creator_id: creatorId,
              };

              await axiosInstance.post(
                `/groups/${groupId}/routines?force_members=${values.force_members}`,
                payload
              );
              router.back();
            } catch (error) {
              const axiosError = error as any; // Cast error to any to access response
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
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            isSubmitting,
            errors,
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
              <OptionPicker
                label="Forzar horarios de los miembros"
                value={values.force_members}
                items={[
                  { label: "Sí", value: "true" },
                  { label: "No", value: "false" },
                ]}
                setValue={(value) => handleChange("force_members")(value)}
              />
              {errors.day && <Text style={styles.errorText}>{errors.day}</Text>}
              {errors.start_hour && (
                <Text style={styles.errorText}>{errors.start_hour}</Text>
              )}

              <Button
                mode="contained"
                onPress={() => handleSubmit()}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={styles.button}
              >
                Guardar
              </Button>
              {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}
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
  errorText: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
  },
});
