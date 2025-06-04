import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Button, TextInput, ActivityIndicator, Menu } from "react-native-paper";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { Formik } from "formik";
import { router } from "expo-router";
import * as Yup from "yup";
import Header from "@/components/Header";
import useAxiosInstance from "@/hooks/useAxios";
import OptionPicker from "@/components/OptionPicker";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("El nombre es obligatorio"),
  description: Yup.string().required("La descripción es obligatoria"),
  day: Yup.string().required("El día es obligatorio"),
  start_hour: Yup.number()
    .min(0, "La hora debe ser mayor a 0")
    .max(23, "La hora debe ser menor a 24")
    .required("La hora de inicio es obligatoria"),
  end_hour: Yup.number()
    .min(0, "La hora debe ser mayor a 0")
    .max(23, "La hora debe ser menor a 24")
    .required("La hora de fin es obligatoria")
    .test(
      "end-greater-than-start",
      "La hora de fin debe ser posterior a la de inicio",
      function (value) {
        const { start_hour } = this.parent;
        return value > start_hour;
      }
    ),
});

const dayOptions = [
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

export default function AddRoutineScreen() {
  const [auth] = useAtom(authenticatedAtom);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dayMenuVisible, setDayMenuVisible] = useState(false);

  // Mock del servicio de usuarios - conecta con el backend real cuando esté listo
  const axiosUser = useAxiosInstance("users");
  const axiosProgress = useAxiosInstance("progress");

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError(null);

    try {
      const userId = auth?.id;

      if (!userId || !auth?.token) {
        setError("Error de autenticación");
        return;
      }

      // Mock de la llamada al backend - reemplaza con la implementación real
      // await axiosUser.post(`/users/${userId}/routines/`, {
      //   name: values.name,
      //   description: values.description,
      //   day: values.day,
      //   start_hour: values.start_hour,
      //   end_hour: values.end_hour,
      // });

      // Simular delay de red para el mock
      //await new Promise((resolve) => setTimeout(resolve, 1500));

      const sendData = {
        user_id: userId,
        name: values.name,
        description: values.description,
        day: values.day,
        start_hour: Number(values.start_hour),
        end_hour: Number(values.end_hour),
      };
      console.log("Sending data: ", sendData);

      const response = await axiosProgress.post(
        `/users/${userId}/routines/`,
        {
          user_id: userId,
          name: values.name,
          description: values.description,
          day: values.day,
          start_hour: Number(values.start_hour),
          end_hour: Number(values.end_hour),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Routine created: ", response.data.data);
      router.back();
    } catch (err: any) {
      console.log("Error creating routine: ", err);
      setError("Ocurrió un error al crear la rutina. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>Agregar Nueva Rutina</Text>

        <Formik
          initialValues={{
            name: "",
            description: "",
            day: "",
            start_hour: "",
            end_hour: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            handleChange,
            handleBlur,
            values,
            errors,
            touched,
            isSubmitting,
            handleSubmit,
            setFieldValue,
          }) => (
            <View style={styles.form}>
              <TextInput
                label="Nombre de la rutina"
                value={values.name}
                onChangeText={handleChange("name")}
                onBlur={handleBlur("name")}
                mode="outlined"
                activeOutlineColor="#287D76"
                error={touched.name && !!errors.name}
                style={styles.input}
              />
              {touched.name && errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}

              <TextInput
                label="Descripción"
                value={values.description}
                onChangeText={handleChange("description")}
                onBlur={handleBlur("description")}
                mode="outlined"
                activeOutlineColor="#287D76"
                multiline
                numberOfLines={3}
                error={touched.description && !!errors.description}
                style={styles.input}
              />
              {touched.description && errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}

              <View>
                <Menu
                  visible={dayMenuVisible}
                  onDismiss={() => setDayMenuVisible(false)}
                  anchor={
                    <TextInput
                      label="Día de la semana"
                      value={
                        dayOptions.find((d) => d.value === values.day)?.label ||
                        ""
                      }
                      onPressIn={() => setDayMenuVisible(true)}
                      mode="outlined"
                      activeOutlineColor="#287D76"
                      editable={false}
                      right={
                        <TextInput.Icon
                          icon={dayMenuVisible ? "menu-up" : "menu-down"}
                          onPress={() => setDayMenuVisible(!dayMenuVisible)}
                        />
                      }
                      error={touched.day && !!errors.day}
                      style={styles.input}
                    />
                  }
                >
                  {dayOptions.map((option) => (
                    <Menu.Item
                      key={option.value}
                      onPress={() => {
                        setFieldValue("day", option.value);
                        setDayMenuVisible(false);
                      }}
                      title={option.label}
                    />
                  ))}
                </Menu>
                {touched.day && errors.day && (
                  <Text style={styles.errorText}>{errors.day}</Text>
                )}
              </View>

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
              {error && <Text style={styles.errorText}>{error}</Text>}

              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={() => router.back()}
                  style={[styles.button, styles.cancelButton]}
                  labelStyle={{ color: "#287D76" }}
                  disabled={loading}
                >
                  Cancelar
                </Button>

                <Button
                  mode="contained"
                  onPress={() => handleSubmit()}
                  style={[styles.button, styles.submitButton]}
                  disabled={loading || isSubmitting}
                  loading={loading}
                >
                  {loading ? "Creando..." : "Crear Rutina"}
                </Button>
              </View>
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
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#287D76",
    textAlign: "center",
    marginBottom: 24,
  },
  form: {
    flex: 1,
    gap: 16,
  },
  input: {
    backgroundColor: "#fff",
  },
  timeContainer: {
    flexDirection: "row",
    gap: 16,
  },
  timeInput: {
    flex: 1,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 16,
    marginTop: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
  },
  cancelButton: {
    borderColor: "#287D76",
  },
  submitButton: {
    backgroundColor: "#287D76",
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
