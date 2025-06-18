import React, { useState, useEffect } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
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
import { castDateToString } from "@/utils/date";

export default function UserPersonalDataSection() {
  const [auth] = useAtom(authenticatedAtom);

  const [editAnthropometricMode, setEditAnthropometricMode] = useState(false);
  const [errorData, setAnthropometricError] = useState<string | null>(null);

  const [editPersonalMode, setEditPersonalMode] = useState(false);
  const [errorPersonal, setErrorPersonal] = useState<string | null>(null);

  const [userPersonalData, setUserPersonalData] =
    useState<UserExtraInfoType | null>(null);
  const [anthropometricData, setAnthropometricData] =
    useState<AnthropometricType | null>(null);

  const axiosProgress = useAxiosInstance("progress");

  const fetchUserPersonalData = async () => {
    try {
      const response = await axiosProgress.get(
        `/users/${auth?.id}/fixedData/`,
        {
          params: { base: true },
        }
      );
      const data = response.data.data;
      data.birthday = castDateToString(data.birthday);
      setUserPersonalData(data);
    } catch (err) {
      setAnthropometricError("No se pudieron obtener los datos del usuario.");
    }
  };

  const fetchUserAnthropometricData = async () => {
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

  useEffect(() => {
    fetchUserPersonalData();
    fetchUserAnthropometricData();
  }, [auth?.id]);

  // Unir los campos y valores iniciales de ambos formularios
  const allFields = [...userPersonalFields, ...anthropometricFields];
  const initialAllValues = allFields.reduce((acc, item) => {
    // Forzamos el acceso dinámico solo si la clave existe en el objeto
    const personalValue =
      userPersonalData &&
      Object.prototype.hasOwnProperty.call(userPersonalData, item.key)
        ? String((userPersonalData as Record<string, any>)[item.key] ?? "")
        : "";
    const anthropometricValue =
      anthropometricData &&
      Object.prototype.hasOwnProperty.call(anthropometricData, item.key)
        ? String((anthropometricData as Record<string, any>)[item.key] ?? "")
        : "";

    acc[item.key] = personalValue || anthropometricValue || "";
    return acc;
  }, {} as Record<string, string>);

  // Unir los esquemas de validación si es necesario, aquí usamos el de datos personales
  // pero podrías combinar ambos si lo necesitas
  const combinedValidationSchema = extraInfoValidationSchema.concat(
    anthropometricValidationSchema
  );

  // PUT datos personales
  const updateUserPersonalData = async (values: Record<string, string>) => {
    await axiosProgress.put(
      `/users/${auth?.id}/fixedData/`,
      {
        birthday: values.birthday,
        height: Number(values.height),
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    setUserPersonalData({
      birthday: values.birthday,
      height: Number(values.height),
    });
  };

  // PUT datos antropométricos
  const updateUserAnthropometricData = async (
    values: Record<string, string>
  ) => {
    await axiosProgress.put(
      `/users/${auth?.id}/anthropometrics/`,
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
    setAnthropometricData({
      weight: values.weight,
      muscleMass: values.muscleMass ? values.muscleMass : "",
      bodyMass: values.bodyMass ? values.bodyMass : "",
      boneMass: values.boneMass ? values.boneMass : "",
    });
  };

  const handleSubmitAll = async (
    values: Record<string, string>,
    { setSubmitting }: FormikHelpers<Record<string, string>>
  ) => {
    setErrorPersonal(null);
    setAnthropometricError(null);
    try {
      await updateUserPersonalData(values);
      await updateUserAnthropometricData(values);

      setEditPersonalMode(false);
      setEditAnthropometricMode(false);
    } catch (err: any) {
      setErrorPersonal("Ocurrió un error al guardar los cambios.");
      setAnthropometricError("Ocurrió un error al guardar los cambios.");
    }
    setSubmitting(false);
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
    >
      <UserFormSection
        title="Tus datos personales y antropométricos"
        fields={allFields}
        initialValues={initialAllValues}
        validationSchema={combinedValidationSchema}
        onSubmit={handleSubmitAll}
        editMode={editPersonalMode || editAnthropometricMode}
        setEditMode={(v: boolean) => {
          setEditPersonalMode(v);
          setEditAnthropometricMode(v);
        }}
        error={errorPersonal || errorData}
        setError={(e: string | null) => {
          setErrorPersonal(e);
          setAnthropometricError(e);
        }}
      />
    </ScrollView>
  );
}
