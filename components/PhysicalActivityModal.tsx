import React from "react";
import { Modal, View, Text, TextInput } from "react-native";
import { Button } from "react-native-paper";
import { Formik } from "formik";

type Props = {
  visible: boolean;
  onClose: () => void;
  userId: string | number | undefined;
  axiosInstance: any;
};

export default function PhysicalActivityModal({
  visible,
  onClose,
  userId,
  axiosInstance,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onDismiss={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 10,
            padding: 20,
            width: 300,
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>
            Registrar actividad física
          </Text>
          <Formik
            initialValues={{
              exerciseName: "",
              caloriesBurned: 0.0,
            }}
            validate={(values) => {
              const errors: any = {};
              if (!values.exerciseName) {
                errors.exerciseName = "El nombre del ejercicio es requerido";
              }
              if (values.caloriesBurned < 0) {
                errors.caloriesBurned =
                  "Las calorías quemadas no pueden ser negativas";
              }
              return errors;
            }}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              try {
                await axiosInstance.post(`/users/${userId}/exercises/`, {
                  userId: userId,
                  exerciseName: values.exerciseName,
                  caloriesBurned: parseFloat(values.caloriesBurned.toString()),
                });
                onClose();
                resetForm();
              } catch (e) {
                // handle error
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
              errors,
              touched,
              isSubmitting,
            }) => (
              <View>
                <Text>Actividad física</Text>
                <TextInput
                  onChangeText={handleChange("exerciseName")}
                  onBlur={handleBlur("exerciseName")}
                  value={values.exerciseName}
                  style={{
                    borderColor: "#2196F3",
                    borderRadius: 5,
                    padding: 8,
                    marginTop: 8,
                    marginBottom: 4,
                  }}
                  placeholder="Ej: Correr 5km"
                />
                {touched.exerciseName && errors.exerciseName && (
                  <Text style={{ color: "red", marginBottom: 8 }}>
                    {errors.exerciseName}
                  </Text>
                )}
                <Text>Calorías quemadas</Text>
                <TextInput
                  onChangeText={handleChange("caloriesBurned")}
                  onBlur={handleBlur("caloriesBurned")}
                  value={values.caloriesBurned.toString()}
                  keyboardType="numeric"
                  style={{
                    borderColor: "#2196F3",
                    borderRadius: 5,
                    padding: 8,
                    marginTop: 8,
                    marginBottom: 4,
                  }}
                  placeholder="Ej: 300"
                />
                {touched.caloriesBurned && errors.caloriesBurned && (
                  <Text style={{ color: "red", marginBottom: 8 }}>
                    {errors.caloriesBurned}
                  </Text>
                )}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    gap: 10,
                  }}
                >
                  <Button
                    textColor="grey"
                    onPress={onClose}
                    mode="text"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onPress={handleSubmit as any}
                    mode="contained"
                    buttonColor="#287D76"
                    loading={isSubmitting}
                  >
                    Agregar
                  </Button>
                </View>
              </View>
            )}
          </Formik>
        </View>
      </View>
    </Modal>
  );
}
