import React, { useState, useEffect } from "react";
import { ScrollView } from "react-native";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import UserFormSection from "./UserFormSection";
import { FormikHelpers } from "formik";
import {
  userPersonalFields,
  extraInfoValidationSchema,
  anthropometricFields,
  anthropometricValidationSchema,
} from "../../../utils/validationSchemas";
import { AnthropometricType } from "../../../types/anthropometricTypes";
import { UserExtraInfoType } from "../../../types/userType";
import useAxiosInstance from "@/hooks/useAxios";

export default function UserPersonalDataSection() {
  const [auth, setIsAuthenticated] = useAtom(authenticatedAtom);

  const [editAnthropometricMode, setEditAnthropometricMode] = useState(false);
  const [errorData, setAnthropometricError] = useState<string | null>(null);
  const [successData, setSuccessAnthropometric] = useState<string | null>(null);

  const [editPersonalMode, setEditPersonalMode] = useState(false);
  const [errorPersonal, setErrorPersonal] = useState<string | null>(null);
  const [successPersonal, setSuccessPersonal] = useState<string | null>(null);

  const [userPersonalData, setUserPersonalData] =
    useState<UserExtraInfoType | null>(null);
  const [anthropometricData, setAnthropometricData] =
    useState<AnthropometricType | null>(null);

  const axiosProgress = useAxiosInstance("progress");

  const fetchAnthropometricData = async () => {
    try {
      const response = await axiosProgress.get(
        `/users/${auth?.id}/anthropometrics/`
      );

      const data = response.data.data[0];

      setAnthropometricData({
        weight: data.weight ? data.weight.toString() : "",
        muscleMass: data.muscle_mass ? data.muscle_mass.toString() : "",
        bodyMass: data.fat_mass ? data.fat_mass.toString() : "",
        boneMass: data.bone_mass ? data.bone_mass.toString() : "",
      });
    } catch (err) {
      setAnthropometricError("No se pudieron obtener los datos del usuario.");
    }
  };

  const fetchPersonalData = async () => {
    try {
      const response = await axiosProgress.get(
        `/users/${auth?.id}/fixedData/`,
        {
          params: { base: true },
        }
      );
      const data = response.data.data;
      setUserPersonalData(data);
    } catch (err) {
      setAnthropometricError("No se pudieron obtener los datos del usuario.");
    }
  };

  useEffect(() => {
    fetchAnthropometricData();
    fetchPersonalData();
  }, []);

  // Construir initialValues solo con los campos definidos en fields y userData
  const initialAnthropometricValues = anthropometricFields.reduce(
    (acc, item) => {
      acc[item.key] = anthropometricData?.[item.key]?.toString() || "";
      return acc;
    },
    {} as Record<string, string>
  );

  // Construir initialValues para datos personales
  const initialPersonalValues = userPersonalFields.reduce((acc, item) => {
    acc[item.key] = userPersonalData?.[item.key]?.toString() || "";
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
      await axiosProgress.put(
        `/users/${userId}/anthropometrics/`,
        {
          weight: parseFloat(values.weight),
          muscle_mass: values.muscleMass ? parseFloat(values.muscleMass) : null,
          fat_mass: values.fatMass ? parseFloat(values.fatMass) : null,
          bone_mass: values.boneMass ? parseFloat(values.boneMass) : null,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setIsAuthenticated((prev) =>
        prev
          ? {
              ...prev,
              weight: parseFloat(values.weight),
              muscleMass: values.muscleMass
                ? parseFloat(values.muscleMass)
                : undefined,
              bodyFatPercentage: values.fatMass
                ? parseFloat(values.fatMass)
                : undefined,
              boneMass: values.boneMass
                ? parseFloat(values.boneMass)
                : undefined,
            }
          : prev
      );

      setAnthropometricData({
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

  const handleSubmitPersonalForm = async (
    values: Record<string, string>,
    { setSubmitting }: FormikHelpers<Record<string, string>>
  ) => {
    setErrorPersonal(null);
    setSuccessPersonal(null);
    try {
      const userId = auth?.id;
      await axiosProgress.put(
        `/users/${userId}/fixedData/`,
        {
          ...values,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setUserPersonalData({
        birthday: values.birthday,
        height: Number(values.height),
      });

      setSuccessPersonal("Datos personales actualizados correctamente.");
      setEditPersonalMode(false);
    } catch (err: any) {
      setErrorPersonal("Ocurrió un error al guardar los cambios.");
    }
    setSubmitting(false);
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
    >
      <UserFormSection
        title="Tus datos personales"
        fields={userPersonalFields.slice()}
        initialValues={initialPersonalValues}
        validationSchema={extraInfoValidationSchema}
        onSubmit={handleSubmitPersonalForm}
        editMode={editPersonalMode}
        setEditMode={setEditPersonalMode}
        error={errorPersonal}
        success={successPersonal}
        setError={setErrorPersonal}
        setSuccess={setSuccessPersonal}
      />
      <UserFormSection
        title="Tus datos personales y antropométricos"
        fields={anthropometricFields.slice()}
        initialValues={initialAnthropometricValues}
        validationSchema={anthropometricValidationSchema}
        onSubmit={handleSubmitAnthropometricForm}
        editMode={editAnthropometricMode}
        setEditMode={setEditAnthropometricMode}
        error={errorData}
        success={successData}
        setError={setAnthropometricError}
        setSuccess={setSuccessAnthropometric}
      />
    </ScrollView>
  );
}
