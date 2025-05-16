import React from 'react';
import { View, Text } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Formik, FormikHelpers } from 'formik';
import { styles } from '../../../styles/homeStyles';

interface Field {
  key: string;
  label: string;
  keyboardType?: string;
  placeholder?: string;
}

interface UserFormSectionProps {
  title: string;
  fields: Field[];
  initialValues: Record<string, string>;
  validationSchema: any;
  onSubmit: (
    values: Record<string, string>,
    helpers: FormikHelpers<Record<string, string>>
  ) => Promise<void>;
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  error?: string | null;
  success?: string | null;
  setError?: (v: string | null) => void;
  setSuccess?: (v: string | null) => void;
}

const UserFormSection: React.FC<UserFormSectionProps> = ({
  title,
  fields,
  initialValues,
  validationSchema,
  onSubmit,
  editMode,
  setEditMode,
  error,
  success,
  setError,
  setSuccess,
}) => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={onSubmit}
    >
      {({ values, handleBlur, handleSubmit, errors, touched, isSubmitting, setFieldValue, resetForm }) => (
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {error && <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>}
          {success && <Text style={{ color: '#287D76', marginBottom: 10 }}>{success}</Text>}
          <View style={styles.formFields}>
            {fields.map((item, index) => (
              <View key={item.key} style={[styles.listRow, index % 2 === 0 ? styles.zebra0 : styles.zebra1, { flexDirection: 'column', alignItems: 'flex-start' }]}> 
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                  <Text style={styles.listLabel}>{item.label}</Text>
                  <TextInput
                    value={values[item.key] ? values[item.key] : (editMode ? "" : "No cargado")}                    
                    onChangeText={v => setFieldValue(item.key, v)}
                    onBlur={() => handleBlur(item.key)}
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
                setError && setError(null);
                setSuccess && setSuccess(null);
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
              Actualizar
            </Button>
          )}
        </View>
      )}
    </Formik>
  );
};

export default UserFormSection;
