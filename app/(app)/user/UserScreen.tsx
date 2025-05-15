import React, { useState, useEffect } from "react";
import { ScrollView } from "react-native";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { objectivesAtom } from "../../../atoms/objectiveAtom";
import axios from "axios";
import { styles } from "../../../styles/homeStyles";
import UserFormSection from "./UserFormSection";
import { FormikHelpers } from 'formik';
import { anthropometricFields, objectivesFields, objectiveValidationSchema, anthropometricValidationSchema  } from "../../../utils/validationSchemas";
import { AnthropometricType, ObjectiveType } from "../../../types/anthropometricTypes";
import { castDateToString } from "../../../utils/casts";


export default function UserScreen() {
  const [auth, setIsAuthenticated] = useAtom(authenticatedAtom);
  const [editAnthropometricMode, setEditAnthropometricMode] = useState(false);
  const [editObjectivesMode, setEditObjectivesMode] = useState(false);
  const [errorAnthropometric, setAnthropometricError] = useState<string | null>(null);
  const [errorObjectives, setObjectivesError] = useState<string | null>(null);
  const [successObjectives, setSuccessObjectives] = useState<string | null>(null);
  const [successAnthropometric, setSuccessAnthropometric] = useState<string | null>(null);
  const [userData, setUserData] = useState<AnthropometricType | null>(null);
  const [objectives, setObjectives] = useState<ObjectiveType | null>(null);




   const fetchObjectiveData = async () => {
      try {
        const BASE_URL = process.env.PROGRESS_SERVICE_URL || "http://localhost:8081";
        const userId = auth?.id;
        
        if (!userId) {
          return;
        }

        if (!auth?.token) {
          return;
        }

        const response = await axios.get(`${BASE_URL}/users/${userId}/objectives/`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth?.token}`,
          },
        });

        const data = response.data.data;
        console.log("data objetivo", data)
        console.log("response objective", response.data)

        setObjectives({
          weight: data.weight ? data.weight.toString() : '',
          muscleMass: data.muscle_mass ? data.muscle_mass.toString() : '',
          bodyMass: data.fat_mass ? data.fat_mass.toString() : '',
          boneMass: data.bone_mass ? data.bone_mass.toString() : '',
          deadline: data.deadline ? castDateToString(data.deadline) : '',
        });
        console.log("User data set: ", userData);
      } catch (err) {
        console.log("Error fetching objectives: ", err);
        setObjectivesError("No se pudieron obtener los datos de los objetivos.");
      }
    };

    const fetchAnthropometricData = async () => {
      try {
        const BASE_URL = process.env.PROGRESS_SERVICE_URL || "http://localhost:8081";
        const userId = auth?.id;
        
        if (!userId) {
          return;
        }

        if (!auth?.token){
          return
        }

        const response = await axios.get(`${BASE_URL}/users/${userId}/anthropometrics/`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth?.token}`,
          },
        });

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
      fetchObjectiveData();
    }
  }, []);

  // Construir initialValues solo con los campos definidos en fields y userData
  const initialAnthropometricValues = anthropometricFields.reduce((acc, item) => {
    acc[item.key] = userData?.[item.key]?.toString() || '';
    console.log("userData", userData)

    return acc;
  }, {} as Record<string, string>);

  const initialObjectivesValues = objectivesFields.reduce((acc, item) => {
    acc[item.key] = objectives?.[item.key]?.toString() || '';
    return acc;
  }, {} as Record<string, string>);




  const handleSubmitAnthropometricForm = async (
    values: Record<string, string>,
    { setSubmitting }: FormikHelpers<Record<string, string>>
  ) => {
    setAnthropometricError(null);
    setSuccessObjectives(null);
    try {
      const BASE_URL = process.env.PROGRESS_SERVICE_URL || "http://localhost:8081";
      const userId = auth?.id;
      await axios.put(
        `${BASE_URL}/users/${userId}/anthropometrics/`,
        {
          weight: parseFloat(values.weight),
          muscle_mass: values.muscleMass ? parseFloat(values.muscleMass) : null,
          fat_mass: values.bodyFatPercentage ? parseFloat(values.bodyFatPercentage) : null,
          bone_mass: values.boneMass ? parseFloat(values.boneMass) : null,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      


      setIsAuthenticated((prev) => prev ? {
        ...prev,
        weight: parseFloat(values.weight),
        muscleMass: values.muscleMass ? parseFloat(values.muscleMass) : undefined,
        bodyFatPercentage: values.bodyFatPercentage ? parseFloat(values.bodyFatPercentage) : undefined,
        boneMass: values.boneMass ? parseFloat(values.boneMass) : undefined,
      } : prev);

      setUserData({
        weight: values.weight,
        muscleMass: values.muscleMass ? values.muscleMass : "",
        bodyMass: values.bodyMass ? values.bodyMass : "",
        boneMass: values.boneMass ? values.boneMass : "",
      });

      setSuccessObjectives("Datos actualizados correctamente.");
      setEditAnthropometricMode(false);

    } catch (err: any) {
      setAnthropometricError("Ocurrió un error al guardar los cambios.");
    }
    setSubmitting(false);
  };

  const handleSubmitObjectivesForm = async (
    values: Record<string, string>,
    {setSubmitting}: FormikHelpers<Record<string, string>>
  ) => {
    setObjectivesError(null);
    setSuccessObjectives(null);
    try {
      const BASE_URL = process.env.PROGRESS_SERVICE_URL || "http://localhost:8081";
      const userId = auth?.id;
      await axios.put(
        `${BASE_URL}/users/${userId}/objectives/`,
        {
          weight: parseFloat(values.weight),
          muscle_mass: values.muscleMass ? parseFloat(values.muscleMass) : null,
          fat_mass: values.bodyFatPercentage ? parseFloat(values.bodyFatPercentage) : null,
          bone_mass: values.boneMass ? parseFloat(values.boneMass) : null,
          deadline: values.deadline ? parseInt(values.deadline) : null,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      setSuccessObjectives("Datos actualizados correctamente.");
      console.log("User data set: ", userData);
      setEditObjectivesMode(false);
    } catch (err: any) {
      setObjectivesError("Ocurrió un error al guardar los cambios.");
    }
    setSubmitting(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.formContainer}>
      
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
