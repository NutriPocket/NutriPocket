import React, { useState, useEffect } from "react";
import { ScrollView } from "react-native";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import UserFormSection from "./UserFormSection";
import { FormikHelpers } from "formik";
import {
  objectivesFields,
  objectiveValidationSchema,
} from "../../../utils/validationSchemas";
import { ObjectiveType } from "../../../types/anthropometricTypes";
import { castDateToString } from "../../../utils/date";
import useAxiosInstance from "@/hooks/useAxios";
import { useFocusEffect } from "@react-navigation/native";

export default function UserObjectivesSection() {
  const [auth] = useAtom(authenticatedAtom);
  const [editObjectivesMode, setEditObjectivesMode] = useState(false);
  const [errorObjectives, setObjectivesError] = useState<string | null>(null);
  const [successObjectives, setSuccessObjectives] = useState<string | null>(
    null
  );
  const [objectives, setObjectives] = useState<ObjectiveType>({
    weight: "",
    muscleMass: "",
    bodyMass: "",
    boneMass: "",
    deadline: "",
    waterIntake: "",
  });
  const axiosProgress = useAxiosInstance("progress");
  const axiosFood = useAxiosInstance("food");

  const fetchObjectiveData = async () => {
    try {
      const userId = auth?.id;

      if (!userId) {
        return;
      }

      if (!auth?.token) {
        return;
      }

      const response = await axiosProgress.get(`/users/${userId}/objectives/`);

      const data = response.data.data;

      setObjectives((prev) => ({
        ...prev,
        weight: data.weight ? String(data.weight) : "",
        muscleMass: data.muscle_mass ? String(data.muscle_mass) : "",
        bodyMass: data.fat_mass ? String(data.fat_mass) : "",
        boneMass: data.bone_mass ? String(data.bone_mass) : "",
        deadline: data.deadline ? castDateToString(data.deadline) : "",
      }));
    } catch (err) {
      console.log("Error fetching objectives: ", err);
      setObjectivesError("No se pudieron obtener los datos de los objetivos.");
    }
  };

  const fetchWaterObjectives = async () => {
    try {
      const response = await axiosFood.get(
        `/users/${auth?.id}/water_consumption/`
      );

      console.log("Water objectives response: ", response.data);

      const goal = response.data?.goal.goal_ml;
      setObjectives((prev) => ({
        ...prev,
        waterIntake: goal ? String(goal) : "",
      }));
    } catch (err) {
      console.log("Error fetching water objectives: ", err);
      setObjectivesError(
        "No se pudieron obtener los datos de los objetivos de agua."
      );
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (auth?.id && auth?.token) {
        fetchObjectiveData();
        fetchWaterObjectives();
      }
    }, [])
  );

  const initialObjectivesValues = objectivesFields.reduce((acc, item) => {
    acc[item.key] = objectives?.[item.key]?.toString() || "";
    return acc;
  }, {} as Record<string, string>);

  const handleSubmitObjectivesForm = async (
    values: Record<string, string>,
    { setSubmitting }: FormikHelpers<Record<string, string>>
  ) => {
    setObjectivesError(null);
    setSuccessObjectives(null);
    try {
      const userId = auth?.id;

      if (!userId) {
        return;
      }

      if (!auth?.token) {
        return;
      }

      await axiosProgress.put(
        `/users/${userId}/objectives/`,
        {
          weight: parseFloat(values.weight),
          muscle_mass: values.muscleMass ? parseFloat(values.muscleMass) : null,
          fat_mass: values.bodyMass ? parseFloat(values.bodyMass) : null,
          bone_mass: values.boneMass ? parseFloat(values.boneMass) : null,
          deadline: values.deadline ? values.deadline : null,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (values.waterIntake) {
        await axiosFood.post(
          `/users/${userId}/water_consumption_goal/${values.waterIntake}`,
          {}
        );
      }

      setObjectives((prev) => ({
        ...prev,
        ...values,
      }));

      setSuccessObjectives("Datos actualizados correctamente.");
      setEditObjectivesMode(false);
    } catch (err: any) {
      console.log("Error: ", err);
      setObjectivesError("Ocurrió un error al guardar los cambios.");
    }
    setSubmitting(false);
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
    >
      <UserFormSection
        title="Tus objetivos"
        fields={objectivesFields.slice()}
        initialValues={initialObjectivesValues}
        validationSchema={objectiveValidationSchema}
        onSubmit={handleSubmitObjectivesForm}
        editMode={editObjectivesMode}
        setEditMode={setEditObjectivesMode}
        error={errorObjectives}
        success={successObjectives}
        setError={setObjectivesError}
        setSuccess={setSuccessObjectives}
      />
    </ScrollView>
  );
}
