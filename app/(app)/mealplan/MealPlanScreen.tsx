import React, { useRef, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { mealPlanListStyles } from "../../../styles/mealStyles";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../../../atoms/authAtom";
import { useEffect } from "react";
import { TouchableRipple, Button, FAB } from "react-native-paper";
import useAxiosInstance from "@/hooks/useAxios";
import { MealPlanType } from "../../../types/mealTypes";
import { router } from "expo-router";
import { Formik } from "formik";
import { createPlanValidationSchema } from "../../../utils/validationSchemas";
import { TextInput as PaperTextInput } from "react-native-paper";
import {
  didFetchUserPlanAtom,
  selectedPlanIdAtom,
} from "../../../atoms/mealPlanAtom";

export default function MealPlanScreen() {
  const [auth] = useAtom(authenticatedAtom);
  const [selectedPlanId, setSelectedPlanId] = useAtom(selectedPlanIdAtom);
  const [mealPlanList, setMealPlanList] = useState<MealPlanType[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const axiosInstance = useAxiosInstance("food");

  const scrollRef = useRef<ScrollView>(null);
  // Ref para guardar la posición X de la card de nuevo plan
  const [newPlanCardX, setNewPlanCardX] = useState(0);
  const newPlanCardRef = useRef(null);
  const [formKey, setFormKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [didFetchUserPlan, setDidFetchUserPlan] = useAtom(didFetchUserPlanAtom);

  const handleSelectPlan = async (planId: number) => {
    try {
      const response = await axiosInstance.put(
        `/users/${auth?.id}/plan`,
        {
          plan_id: planId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      await axiosInstance.post(
        `/users/${auth?.id}/water_consumption_goal/${2000}`,
        {}
      );

      setSelectedPlanId(planId);
    } catch (error) {
      console.error("Error selecting plan: ", error);
    }
  };

  const handleCreatePlan = async (value: any) => {
    router.push({
      pathname: "/mealplan/PlanPreferences",
      params: {
        title: value.title,
        objective: value.objective,
        description: value.description,
      },
    });
    setFormKey((k) => k + 1);
  };

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/plans`);
      const data = response.data.data;
      setMealPlanList(data);
    } catch (err) {
      setError("No se pudieron obtener los datos del usuario.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPlan = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/users/${auth?.id}/plan`);
      const data = response.data.data;
      setSelectedPlanId(data.id_plan);
    } catch (err: any) {
      // Si es 404, no mostrar error (es un caso esperado)
      if (err?.response?.status === 404) {
        setSelectedPlanId(null);
      } else {
        setError("No se pudieron obtener los planes de comidas.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!didFetchUserPlan) {
      fetchUserPlan().then(() => setDidFetchUserPlan(true));
    }
    fetchPlans();
  }, [didFetchUserPlan]);

  if (isLoading) {
    return (
      <View style={mealPlanListStyles.screenContainer}>
        <Text style={mealPlanListStyles.title}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={mealPlanListStyles.screenContainer}>
      <Text style={mealPlanListStyles.title}>Plan de Comidas</Text>
      <Text style={mealPlanListStyles.info}>
        Elegí un plan o creá uno nuevo
      </Text>
      {error && <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>}
      {/* Scroll horizontal para las tarjetas de planes + tarjeta de nuevo plan */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={mealPlanListStyles.cardsContainer}
        style={{ maxHeight: 420 }}
      >
        {mealPlanList.map((plan: MealPlanType) => (
          <TouchableRipple
            key={plan.id_plan}
            style={[
              mealPlanListStyles.planCard,
              { width: 300, marginRight: 16, flexShrink: 0 },
              selectedPlanId === plan.id_plan && {
                borderColor: "#287D76",
                borderWidth: 2,
              },
            ]}
            onPress={() => handleSelectPlan(plan.id_plan)}
          >
            <View style={{ flex: 1, justifyContent: "space-between" }}>
              <View>
                <Text style={mealPlanListStyles.planName}>{plan.title}</Text>
                <Text style={mealPlanListStyles.planDescription}>
                  {plan.plan_description}
                </Text>
                <Text style={{ fontSize: 13 }}>{plan.objective}</Text>
              </View>
              {selectedPlanId === plan.id_plan && (
                <View>
                  <Text style={mealPlanListStyles.selection}>Seleccionado</Text>
                </View>
              )}
            </View>
          </TouchableRipple>
        ))}
        {/* Tarjeta de agregar nuevo plan */}
        <View
          ref={newPlanCardRef}
          style={[mealPlanListStyles.planCard, mealPlanListStyles.addPlanCard]}
          onLayout={(event) => {
            setNewPlanCardX(event.nativeEvent.layout.x);
          }}
        >
          <Text style={mealPlanListStyles.planName}>Nuevo plan</Text>
          <Formik
            key={formKey}
            initialValues={{ title: "", objective: "", description: "" }}
            validationSchema={createPlanValidationSchema}
            onSubmit={handleCreatePlan}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isSubmitting,
            }) => (
              <View style={{}}>
                <PaperTextInput
                  label="Título"
                  value={values.title}
                  onChangeText={handleChange("title")}
                  onBlur={handleBlur("title")}
                  style={mealPlanListStyles.input}
                  mode="outlined"
                  activeOutlineColor="#287D76"
                  dense
                  error={touched.title && !!errors.title}
                />
                {touched.title && errors.title && (
                  <Text style={{ color: "red", marginBottom: 4 }}>
                    {errors.title}
                  </Text>
                )}
                <PaperTextInput
                  label="Objetivo"
                  value={values.objective}
                  onChangeText={handleChange("objective")}
                  onBlur={handleBlur("objective")}
                  style={mealPlanListStyles.input}
                  mode="outlined"
                  activeOutlineColor="#287D76"
                  dense
                  error={touched.objective && !!errors.objective}
                />
                {touched.objective && errors.objective && (
                  <Text style={{ color: "red", marginBottom: 4 }}>
                    {errors.objective}
                  </Text>
                )}
                <PaperTextInput
                  label="Descripción"
                  value={values.description}
                  onChangeText={handleChange("description")}
                  onBlur={handleBlur("description")}
                  style={mealPlanListStyles.input}
                  mode="outlined"
                  activeOutlineColor="#287D76"
                  dense
                  multiline
                  error={touched.description && !!errors.description}
                />
                {touched.description && errors.description && (
                  <Text style={{ color: "red", marginBottom: 4 }}>
                    {errors.description}
                  </Text>
                )}
                {createError && (
                  <Text style={{ color: "red", marginTop: 4 }}>
                    {createError}
                  </Text>
                )}
                <Button
                  mode="contained"
                  onPress={() => handleSubmit()}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={mealPlanListStyles.planButtonCreate}
                >
                  Guardar
                </Button>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
      <FAB
        icon="plus"
        label="Crear nuevo plan"
        style={{
          position: "absolute",
          right: 24,
          bottom: 32,
          backgroundColor: "#287D76",
        }}
        color="#fff"
        onPress={() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTo({ x: newPlanCardX, animated: true });
          }
        }}
      />
    </View>
  );
}
