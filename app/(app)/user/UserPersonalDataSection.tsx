import React, { useState, useEffect } from "react";
import { ScrollView } from "react-native";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import UserFormSection from "./UserFormSection";
import { FormikHelpers } from 'formik';
import { anthropometricFields, anthropometricValidationSchema } from "../../../utils/validationSchemas";
import { AnthropometricType } from "../../../types/anthropometricTypes";
import useAxiosInstance from "@/hooks/useAxios"

export default function UserPersonalDataSection() {
    const [auth, setIsAuthenticated] = useAtom(authenticatedAtom);
    const [editAnthropometricMode, setEditAnthropometricMode] = useState(false);
    const [errorAnthropometric, setAnthropometricError] = useState<string | null>(null);
    const [successAnthropometric, setSuccessAnthropometric] = useState<string | null>(null);
    const [userData, setUserData] = useState<AnthropometricType | null>(null);
    const axiosProgress = useAxiosInstance('progress');

    const fetchAnthropometricData = async () => {
        try {
            const userId = auth?.id;

            if (!userId) {
                return;
            }

            if (!auth?.token) {
                return
            }

            const response = await axiosProgress.get(`/users/${userId}/anthropometrics/`);

            const data = response.data.data[0];

            setUserData({
                weight: data.weight ? data.weight.toString() : '',
                muscleMass: data.muscle_mass ? data.muscle_mass.toString() : '',
                bodyMass: data.fat_mass ? data.fat_mass.toString() : '',
                boneMass: data.bone_mass ? data.bone_mass.toString() : '',
            });

        } catch (err) {
            setAnthropometricError("No se pudieron obtener los datos del usuario.");
        }
    };

    useEffect(() => {
        if (auth?.id && auth?.token) {
            fetchAnthropometricData();
        }
    }, []);

    // Construir initialValues solo con los campos definidos en fields y userData
    const initialAnthropometricValues = anthropometricFields.reduce((acc, item) => {
        acc[item.key] = userData?.[item.key]?.toString() || '';
        return acc;
    }, {} as Record<string, string>);

    const handleSubmitAnthropometricForm = async (
        values: Record<string, string>,
        { setSubmitting }: FormikHelpers<Record<string, string>>
    ) => {
        setAnthropometricError(null);
        setSuccessAnthropometric(null);
        try {
            const userId = auth?.id;
            await axiosProgress.put(`/users/${userId}/anthropometrics/`,
                {
                    weight: parseFloat(values.weight),
                    muscle_mass: values.muscleMass ? parseFloat(values.muscleMass) : null,
                    fat_mass: values.fatMass ? parseFloat(values.fatMass) : null,
                    bone_mass: values.boneMass ? parseFloat(values.boneMass) : null,
                },
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            setIsAuthenticated((prev) => prev ? {
                ...prev,
                weight: parseFloat(values.weight),
                muscleMass: values.muscleMass ? parseFloat(values.muscleMass) : undefined,
                bodyFatPercentage: values.fatMass ? parseFloat(values.fatMass) : undefined,
                boneMass: values.boneMass ? parseFloat(values.boneMass) : undefined,
            } : prev);

            setUserData({
                weight: values.weight,
                muscleMass: values.muscleMass ? values.muscleMass : "",
                bodyMass: values.bodyMass ? values.bodyMass : "",
                boneMass: values.boneMass ? values.boneMass : "",
            });

            setSuccessAnthropometric("Datos actualizados correctamente.");
            setEditAnthropometricMode(false);

        } catch (err: any) {
            setAnthropometricError("Ocurrió un error al guardar los cambios.");
        }
        setSubmitting(false);
    };

    return (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}>
            <UserFormSection
                title="Tus datos personales y antropométricos"
                fields={anthropometricFields.slice()}
                initialValues={initialAnthropometricValues}
                validationSchema={anthropometricValidationSchema}
                onSubmit={handleSubmitAnthropometricForm}
                editMode={editAnthropometricMode}
                setEditMode={setEditAnthropometricMode}
                error={errorAnthropometric}
                success={successAnthropometric}
                setError={setAnthropometricError}
                setSuccess={setSuccessAnthropometric}
            />
        </ScrollView>
    );
}
