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

export default function WaterConsumptionModal({
                                                  visible,
                                                  onClose,
                                                  userId,
                                                  axiosInstance,
                                              }: Props) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
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
                        Agregar agua consumida
                    </Text>
                    <Formik
                        initialValues={{ water: "" }}
                        validate={(values) => {
                            const errors: { water?: string } = {};
                            if (!values.water) {
                                errors.water = "Requerido";
                            } else if (
                                !/^\d+$/.test(values.water) ||
                                parseInt(values.water) <= 0
                            ) {
                                errors.water = "Ingrese un número válido mayor a 0";
                            }
                            return errors;
                        }}
                        onSubmit={async (values, { setSubmitting, resetForm }) => {
                            try {
                                console.log("Submitting water consumption:", values.water);
                                await axiosInstance.post(`/users/${userId}/water_consumption/${parseInt(values.water)}`);
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
                                <Text>¿Cuánta agua consumiste? (ml)</Text>
                                <TextInput
                                    keyboardType="numeric"
                                    onChangeText={handleChange("water")}
                                    onBlur={handleBlur("water")}
                                    value={values.water}
                                    style={{
                                        borderColor: "#2196F3",
                                        borderRadius: 5,
                                        padding: 8,
                                        marginTop: 8,
                                        marginBottom: 4,
                                    }}
                                    placeholder="Ej: 250"
                                />
                                {errors.water && touched.water && (
                                    <Text style={{ color: "red", marginBottom: 8 }}>
                                        {errors.water}
                                    </Text>
                                )}
                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "flex-end",
                                        gap: 10,
                                    }}
                                >
                                    <Button onPress={onClose} mode="text" disabled={isSubmitting}>
                                        Cancelar
                                    </Button>
                                    <Button
                                        onPress={handleSubmit as any}
                                        mode="contained"
                                        buttonColor="#2196F3"
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