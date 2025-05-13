import React, { useState, useEffect } from "react";
import { ScrollView, View, Text } from "react-native";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { TextInput, Button } from "react-native-paper";
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import axios from "axios";
import { styles } from "../home/styles";

type UserFormValues = {
  weight: string;
  muscleMass: string;
  bodyFatPercentage: string;
  boneMass: string;
};

export default function UserScreen() {
  const [auth, setIsAuthenticated] = useAtom(authenticatedAtom);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserFormValues | null>(null); 

  const fields = [
    { key: 'weight', label: 'Peso (kg)', keyboardType: 'numeric', placeholder: undefined },
    { key: 'muscleMass', label: 'Masa muscular (%)', keyboardType: 'numeric', placeholder: undefined },
    { key: 'bodyFatPercentage', label: 'Porcentaje de grasa (%)', keyboardType: 'numeric', placeholder: undefined },
    { key: 'boneMass', label: 'Masa ósea (%)', keyboardType: 'numeric', placeholder: undefined },
  ] as const;

  const validationSchema = Yup.object({
    weight: Yup.number().typeError('El peso debe ser un número válido').min(10).max(300).required('El peso es obligatorio'),
    muscleMass: Yup.number().typeError('La masa muscular debe ser un número válido').min(0).max(100).nullable(),
    bodyFatPercentage: Yup.number().typeError('El porcentaje de grasa debe ser un número válido').min(0).max(100).nullable(),
    boneMass: Yup.number().typeError('La masa ósea debe ser un número válido').min(0).max(100).nullable(),
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const BASE_URL = process.env.PROGRESS_SERVICE_URL || "http://localhost:8081";
        const userId = auth?.id;
        if (!userId) {
          setError("No se pudo obtener el ID del usuario.");
          return;
        }

        const response = await axios.get(`${BASE_URL}/users/${userId}/anthropometrics/`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth?.token}`,
          },
        });

        console.log("User data: ", response.data);
        
        setUserData({
          weight: response.data.weight,
          muscleMass: response.data.muscleMass,
          bodyFatPercentage: response.data.bodyFatPercentage,
          boneMass: response.data.boneMass,
        });
        console.log("User data set: ", userData);

      } catch (err) {
        setError("No se pudieron obtener los datos del usuario.");
      }
    };
    if (auth?.id && auth?.token) {
      fetchUserData();
    }
  }, [auth?.id, auth?.token]);

  // Construir initialValues solo con los campos definidos en fields y userData
  const initialValues = fields.reduce((acc, item) => {
    acc[item.key] = userData?.[item.key]?.toString() || '';
    return acc;
  }, {} as Record<string, string>);

  const handleSubmitForm = async (
    values: Record<string, string>,
    { setSubmitting, resetForm }: FormikHelpers<Record<string, string>>
  ) => {
    setError(null);
    setSuccess(null);
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
      setSuccess("Datos actualizados correctamente.");
      setEditMode(false);
    } catch (err: any) {
      setError("Ocurrió un error al guardar los cambios.");
    }
    setSubmitting(false);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={handleSubmitForm}
    >
      {({ values, handleBlur, handleSubmit, errors, touched, isSubmitting, setFieldValue, resetForm }) => (
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Tus datos personales y antropométricos</Text>
          {error && <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>}
          {success && <Text style={{ color: '#287D76', marginBottom: 10 }}>{success}</Text>}
          <View style={styles.formFields}>
            {fields.map((item, index) => (
              <View key={item.key} style={[styles.listRow, index % 2 === 0 ? styles.zebra0 : styles.zebra1, { flexDirection: 'column', alignItems: 'flex-start' }]}> 
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                  <Text style={styles.listLabel}>{item.label}</Text>
                  <TextInput
                    value={values[item.key]}
                    onChangeText={v => setFieldValue(item.key, v)}
                    onBlur={handleBlur(item.key)}
                    style={styles.listInput}
                    keyboardType={item.keyboardType as any}
                    editable={editMode}
                    underlineColor="transparent"
                    placeholder={item.placeholder}
                    error={editMode && !!(touched[item.key] && errors[item.key])}
                    selectionColor={editMode ? '#287D76' : 'transparent'}
                    theme={{
                      colors: {
                        primary: editMode ? '#287D76' : 'transparent',
                        outline: 'transparent',
                        background: 'transparent',
                      },
                    }}
                  />
                </View>
                {editMode && touched[item.key] && errors[item.key] && typeof errors[item.key] === 'string' && (
                  <Text style={{ color: 'red', marginLeft: 10, marginTop: 4, fontSize: 13 }}>{errors[item.key]}</Text>
                )}
              </View>
            ))}
          </View>
          {editMode ? (
            <View style={{ width: '100%', marginTop:50 }}>
              <Button mode="contained" onPress={handleSubmit as any} disabled={isSubmitting} style={{ backgroundColor: '#287D76', width: '100%' }}>
                Confirmar
              </Button>
              <Button mode="outlined" onPress={() => {
                setEditMode(false);
                setError(null);
                setSuccess(null);
                resetForm();
              }} style={{ width: '100%', marginTop: 10 }}>
                Volver
              </Button>
            </View>
          ) : (
            <Button mode="contained" onPress={() => {
              setEditMode(true);
              resetForm();
            }} style={{ marginTop: 20, backgroundColor: '#287D76', width: '100%' }}>
              Editar
            </Button>
          )}
        </View>
      )}
    </Formik>
  );
}
