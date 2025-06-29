import * as Yup from 'yup';
  
  
  export const anthropometricFields = [
    { key: 'weight', label: 'Peso (kg)', keyboardType: 'numeric', placeholder: undefined },
    { key: 'muscleMass', label: 'Masa muscular (%)', keyboardType: 'numeric', placeholder: undefined },
    { key: 'bodyMass', label: 'Porcentaje de grasa (%)', keyboardType: 'numeric', placeholder: undefined },
    { key: 'boneMass', label: 'Masa ósea (%)', keyboardType: 'numeric', placeholder: undefined },
  ] as const;

  export const objectivesFields = [
    { key: 'weight', label: 'Peso (kg)', keyboardType: 'numeric', placeholder: "-" },
    { key: 'muscleMass', label: 'Masa muscular (%)', keyboardType: 'numeric', placeholder: undefined },
    { key: 'bodyMass', label: 'Porcentaje de grasa (%)', keyboardType: 'numeric', placeholder: undefined },
    { key: 'boneMass', label: 'Masa ósea (%)', keyboardType: 'numeric', placeholder: undefined },
    { key: 'deadline', label: 'Fecha objetivo', keyboardType: 'numeric', placeholder: undefined },
  ] as const;

export const userPersonalFields = [
  { key: 'height', label: 'Altura (cm)', keyboardType: 'numeric', placeholder: undefined },
  { key: 'birthday', label: 'Fecha de nacimiento', keyboardType: 'default', placeholder: "YYYY-MM-DD" },
];

  export const objectiveValidationSchema = Yup.object({
  weight: Yup.number()
    .typeError("El peso objetivo debe ser un número válido")
    .min(10, "El peso debe ser al menos 10 kg")
    .max(300, "El peso no puede superar los 300 kg")
    .required("Por favor, ingresa tu peso objetivo"),
  muscleMass: Yup.number()
    .typeError("La masa muscular objetivo debe ser un número válido")
    .min(0, "El porcentaje de masa muscular debe ser al menos 0%")
    .max(100, "El porcentaje de masa muscular no puede superar el 100%")
    .optional(),
  fatMass: Yup.number()
    .typeError("El porcentaje de grasa objetivo debe ser un número válido")
    .min(0, "El porcentaje de grasa debe ser al menos 0%")
    .max(100, "El porcentaje de grasa no puede superar el 100%")
    .optional(),
    boneMass: Yup.number()
    .typeError("La masa ósea objetivo debe ser un número válido")
    .min(0, "El porcentaje de masa ósea debe ser al menos 0%")
    .max(100, "El porcentaje de masa ósea no puede superar el 100%")
    .optional(),
  deadline: Yup.string()
    .required("Por favor, ingresa la fecha objetivo")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)")
    .test("is-future-date", "La fecha objetivo debe ser futura", (value) => {
      if (!value) return true; // Skip validation if value is empty
      const today = new Date();
      const targetDate = new Date(value);
      return targetDate > today;
    }
  ),
  
});

  export const anthropometricValidationSchema = Yup.object({
  weight: Yup.number()
    .typeError("El peso debe ser un número válido")
    .min(10, "El peso debe ser al menos 10 kg")
    .max(300, "El peso no puede superar los 300 kg")
    .required("Por favor, ingresa tu peso"),
  muscleMass: Yup.number()
    .typeError("La masa muscular debe ser un número válido")
    .min(0, "El porcentaje de masa muscular debe ser al menos 0%")
    .max(100, "El porcentaje de masa muscular no puede superar el 100%")
    .optional(),
  bodyFatPercentage: Yup.number()
    .typeError("El porcentaje de grasa debe ser un número válido")
    .min(0, "El porcentaje de grasa debe ser al menos 0%")
    .max(100, "El porcentaje de grasa no puede superar el 100%")
    .optional(),
  boneMass: Yup.number()
    .typeError("La masa ósea debe ser un número válido")
    .min(0, "La masa ósea no puede ser negativa")
    .max(100, "La masa ósea no puede superar los 100%")
    .optional(),
});


export const extraInfoValidationSchema = Yup.object({
  height: Yup.number()  
    .typeError("La altura debe ser un número válido")
    .min(50, "La altura debe ser al menos 50 cm")
    .max(300, "La altura no puede superar los 300 cm")
    .required("Por favor, ingresa tu altura"),
  birthday: Yup.string()
    .required("Por favor, ingresa tu fecha de nacimiento.")
    .matches(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, "Formato de fecha inválido (YYYY-MM-DD)")
    .test("is-future-date", "La fecha de nacimiento no puede ser futura", (value) => {
      if (!value) return true;
      const today = new Date();
      const birthday = new Date(value);
      return birthday < today;
    }),
});


export const loginValidationSchema = Yup.object({
  emailOrUsername: Yup.string().required("Por favor, ingresa tu email o usuario."),
  password: Yup.string().required("Por favor, ingresa tu contraseña."),
});

export const registerValidationSchema = Yup.object({
  username: Yup.string().required("Por favor, ingresa tu nombre de usuario."),  
  email: Yup.string().email("Email inválido").required("Por favor, ingresa tu email."),
  password: Yup.string().required("Por favor, ingresa tu contraseña."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), ''], 'Las contraseñas no coinciden')
    .required('Por favor, confirma tu contraseña.'),
});

export const createPlanValidationSchema = Yup.object({
  title: Yup.string().required("Por favor, ingresa el título del plan."),
  objective: Yup.string().required("Por favor, ingresa el objetivo del plan."),
  description: Yup.string().required("Por favor, ingresa la descripción del plan."),
});
  
export const createFoodValidationSchema = Yup.object({
  name: Yup.string()
    .required("Por favor, ingresa el nombre del alimento."),
  description: Yup.string()
    .required("Por favor, ingresa la descripción del alimento."),
});
