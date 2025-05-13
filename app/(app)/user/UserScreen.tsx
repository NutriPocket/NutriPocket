import React, { useState } from "react";
import { View, Text } from "react-native";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { TextInput, Button } from "react-native-paper";
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from "axios";
import { styles } from "../home/styles";

export default function UserScreen() {
  const [auth, setIsAuthenticated] = useAtom(authenticatedAtom);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fields = [
    { key: 'username', label: 'Nombre', keyboardType: 'default', placeholder: undefined },
    { key: 'email', label: 'Email', keyboardType: 'email-address', placeholder: undefined },
    { key: 'birthdate', label: 'Fecha de nacimiento', keyboardType: 'default', placeholder: 'YYYY-MM-DD' },
    { key: 'height', label: 'Altura (cm)', keyboardType: 'numeric', placeholder: undefined },
    { key: 'weight', label: 'Peso (kg)', keyboardType: 'numeric', placeholder: undefined },
    { key: 'muscleMass', label: 'Masa muscular (%)', keyboardType: 'numeric', placeholder: undefined },
    { key: 'bodyFatPercentage', label: 'Porcentaje de grasa (%)', keyboardType: 'numeric', placeholder: undefined },
    { key: 'boneMass', label: 'Masa ósea (%)', keyboardType: 'numeric', placeholder: undefined },
  ] as const;

  const validationSchema = Yup.object({
    username: Yup.string().required('El nombre es obligatorio'),
    email: Yup.string().email('Email inválido').required('El email es obligatorio'),
    birthdate: Yup.string().required('La fecha de nacimiento es obligatoria').matches(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
    height: Yup.number().typeError('La altura debe ser un número válido').min(50).max(300).optional(),
    weight: Yup.number().typeError('El peso debe ser un número válido').min(10).max(300).required('El peso es obligatorio'),
    muscleMass: Yup.number().typeError('La masa muscular debe ser un número válido').min(0).max(100).nullable(),
    bodyFatPercentage: Yup.number().typeError('El porcentaje de grasa debe ser un número válido').min(0).max(100).nullable(),
    boneMass: Yup.number().typeError('La masa ósea debe ser un número válido').min(0).max(100).nullable(),
  });

  return (
    <Formik
      initialValues={{
        username: auth?.username || '',
        email: auth?.email || '',
        birthdate: auth?.birthdate || '',
        height: auth?.height?.toString() || '',
        weight: auth?.weight?.toString() || '',
        muscleMass: auth?.muscleMass?.toString() || '',
        bodyFatPercentage: auth?.bodyFatPercentage?.toString() || '',
        boneMass: auth?.boneMass?.toString() || '',
      }}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        setError(null);
        setSuccess(null);
        try {
          const BASE_URL = process.env.PROGRESS_SERVICE_URL || "http://localhost:8081";
          const userId = auth?.id;
          await axios.put(
            `${BASE_URL}/users/${userId}/fixedData/`,
            {
              birthday: values.birthdate,
              height: parseInt(values.height, 10),
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${auth?.token}`,
              },
            }
          );
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
            ...values,
            height: parseInt(values.height, 10),
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
      }}
    >
      {({ values, handleChange, handleBlur, handleSubmit, errors, touched, isSubmitting, setFieldValue, resetForm }) => (
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Tus datos personales y antropométricos</Text>
          {error && <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>}
          {success && <Text style={{ color: '#287D76', marginBottom: 10 }}>{success}</Text>}
          <View style={styles.formFields}>
            {fields.map((item, index) => (
              <View key={item.key} style={[styles.listRow, index % 2 === 0 ? styles.zebra0 : styles.zebra1]}>
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
                  blurOnSubmit={true}
                  onFocus={e => {
                    if (!editMode) e.target.blur();
                  }}
                />
              </View>
            ))}
            {editMode && fields.map((item) => (
              touched[item.key] && errors[item.key] && typeof errors[item.key] === 'string' ? (
                <Text key={item.key + '-err'} style={{ color: 'red', marginLeft: 10, marginBottom: -5, fontSize: 13 }}>{errors[item.key]}</Text>
              ) : null
            ))}
          </View>
          {editMode ? (
            <View style={{ width: '100%', marginTop: 20 }}>
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
            <Button mode="contained" onPress={() => setEditMode(true)} style={{ marginTop: 20, backgroundColor: '#287D76', width: '100%' }}>
              Editar
            </Button>
          )}
        </View>
      )}
    </Formik>
  );
}
