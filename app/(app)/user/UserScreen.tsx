import React, { useState, useEffect } from "react";
import { ScrollView } from "react-native";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import axios from "axios";
import { styles } from "../home/styles";
import UserFormSection from "./UserFormSection";
import * as Yup from 'yup';
import { FormikHelpers } from 'formik';

type AnthropometricFormValues = {
  weight: string;
  muscleMass: string;
  bodyFatPercentage: string;
  boneMass: string;
};

type ObjectivesFormValues = {
  weight: string;
  muscleMass: string;
  bodyFatPercentage: string;
  boneMass: string;
  objectiveTime: string;
};

export default function UserScreen() {
  const [auth, setIsAuthenticated] = useAtom(authenticatedAtom);
  const [editAnthropometricMode, setEditAnthropometricMode] = useState(false);
  const [editObjectivesMode, setEditObjectivesMode] = useState(false);
  const [errorAnthropometric, setAnthropometricError] = useState<string | null>(null);
  const [errorObjectives, setObjectivesError] = useState<string | null>(null);
  const [successObjectives, setSuccessObjetives] = useState<string | null>(null);
  const [successAnthropometric, setSuccessAnthropometric] = useState<string | null>(null);
  const [userData, setUserData] = useState<AnthropometricFormValues | null>(null);
  const [objectives, setObjectives] = useState<ObjectivesFormValues | null>(null);

  const anthropometricFields = [
    { key: 'weight', label: 'Peso (kg)', keyboardType: 'numeric', placeholder: undefined },
    { key: 'muscleMass', label: 'Masa muscular (%)', keyboardType: 'numeric', placeholder: undefined },
    { key: 'bodyFatPercentage', label: 'Porcentaje de grasa (%)', keyboardType: 'numeric', placeholder: undefined },
    { key: 'boneMass', label: 'Masa ósea (%)', keyboardType: 'numeric', placeholder: undefined },
  ] as const;

  const objectivesFields = [
    { key: 'weight', label: 'Peso (kg)', keyboardType: 'numeric', placeholder: undefined },
    { key: 'muscleMass', label: 'Masa muscular (%)', keyboardType: 'numeric', placeholder: undefined },
    { key: 'bodyFatPercentage', label: 'Porcentaje de grasa (%)', keyboardType: 'numeric', placeholder: undefined },
    { key: 'boneMass', label: 'Masa ósea (%)', keyboardType: 'numeric', placeholder: undefined },
    { key: 'objectiveTime', label: 'Tiempo objetivo (fecha)', keyboardType: 'numeric', placeholder: undefined },
  ] as const;

  const validationAnthropometricSchema = Yup.object({
    weight: Yup.number().typeError('El peso debe ser un número válido').min(10).max(300).required('El peso es obligatorio'),
    muscleMass: Yup.number().typeError('La masa muscular debe ser un número válido').min(0).max(100).nullable(),
    bodyFatPercentage: Yup.number().typeError('El porcentaje de grasa debe ser un número válido').min(0).max(100).nullable(),
    boneMass: Yup.number().typeError('La masa ósea debe ser un número válido').min(0).max(100).nullable(),
  });

  const validationObjectivesSchema = Yup.object({
    weight: Yup.number().typeError('El peso debe ser un número válido').min(10).max(300).required('El peso es obligatorio'),
    muscleMass: Yup.number().typeError('La masa muscular debe ser un número válido').min(0).max(100).nullable(),
    bodyFatPercentage: Yup.number().typeError('El porcentaje de grasa debe ser un número válido').min(0).max(100).nullable(),
    boneMass: Yup.number().typeError('La masa ósea debe ser un número válido').min(0).max(100).nullable(),
    objectiveDate: Yup.date().typeError('El tiempo objetivo debe ser una fecha válida').min(new Date()).max(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)).required('El tiempo objetivo es obligatorio'),
  });

  const castDateToString = (date: Date) => {
    date = new Date(date);

    console.log("date type", typeof date)
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    return date.toLocaleDateString('es-ES', options);
  };


   const fetchObjective = async () => {
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
          bodyFatPercentage: data.fat_mass ? data.fat_mass.toString() : '',
          boneMass: data.bone_mass ? data.bone_mass.toString() : '',
          objectiveTime: data.deadline ? castDateToString(data.deadline) : '',
        });
        console.log("User data set: ", userData);
      } catch (err) {
        console.log("Error fetching objectives: ", err);
        setObjectivesError("No se pudieron obtener los datos de los objetivos.");
      }
    };

    const fetchUserData = async () => {
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
          bodyFatPercentage: data.fat_mass ? data.fat_mass.toString() : '',
          boneMass: data.bone_mass ? data.bone_mass.toString() : '',
        });
        //console.log("User data set: ", userData);

      } catch (err) {
        setAnthropometricError("No se pudieron obtener los datos del usuario.");
      }
    };
  useEffect(() => {
   
    if (auth?.id && auth?.token) {
      fetchUserData();
      fetchObjective();
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

  const handleSubmitForm = async (
    values: Record<string, string>,
    { setSubmitting }: FormikHelpers<Record<string, string>>
  ) => {
    setAnthropometricError(null);
    setSuccessObjetives(null);
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
      // Actualizar solo los campos del atom
      setIsAuthenticated((prev) => prev ? {
        ...prev,
        weight: parseFloat(values.weight),
        muscleMass: values.muscleMass ? parseFloat(values.muscleMass) : undefined,
        bodyFatPercentage: values.bodyFatPercentage ? parseFloat(values.bodyFatPercentage) : undefined,
        boneMass: values.boneMass ? parseFloat(values.boneMass) : undefined,
      } : prev);

      setSuccessObjetives("Datos actualizados correctamente.");
      setEditAnthropometricMode(false);
    } catch (err: any) {
      setAnthropometricError("Ocurrió un error al guardar los cambios.");
    }
    setSubmitting(false);
  };

  const handleSubmitObjectivesForm = async (
    values: Record<string, string>,
    { setSubmitting}: FormikHelpers<Record<string, string>>
  ) => {
    setObjectivesError(null);
    setSuccessObjetives(null);
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
          objectives_time: values.objectiveTime ? parseInt(values.objectiveTime) : null,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );


      setSuccessObjetives("Datos actualizados correctamente.");
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
        validationSchema={validationAnthropometricSchema}
        onSubmit={handleSubmitForm}
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
        validationSchema={validationObjectivesSchema}
        onSubmit={handleSubmitObjectivesForm}
        editMode={editObjectivesMode}
        setEditMode={setEditObjectivesMode}
        error={errorObjectives}
        success={successObjectives}
        setError={setObjectivesError}
        setSuccess={setSuccessObjetives}
      />

    </ScrollView>
  );
}
