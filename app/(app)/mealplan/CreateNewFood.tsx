import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
} from "react-native";
import { Formik } from "formik";
import { TextInput } from "react-native-paper";
import { createFoodValidationSchema } from "@/utils/validationSchemas";
import { useRouter, useLocalSearchParams  } from "expo-router";
import useAxiosInstance from "@/hooks/useAxios";
import Header from "../../../components/Header";
import {CustomDropdown} from "@/components/CustomDropdown";

const INGREDIENT_UNITS = [
    { label: "g", value: "gram" },
    { label: "unidad", value: "unit" },
];

const CreateNewFood = () => {
    const { selectedPlanId } = useLocalSearchParams();
    const [page, setPage] = useState(0);
    const [ingredientOptions, setIngredientOptions] = useState<
        { label: string; value: string }[]
    >([]);
    const [error, setError] = useState<string | null>(null);

    const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
    const [quantity, setQuantity] = useState<string>("");
    const [unit, setUnit] = useState<string>("gram");

    const router = useRouter();
    const axiosInstance = useAxiosInstance("food");

    const initialValues = {
        name: "",
        description: "",
        price: 0,
        id: 0,
        image_url: "",
        ingredients: [] as {
            id: string;
            quantity: string;
            unit: string;
        }[],
    };

    type FoodFormValues = typeof initialValues;

    const fetchIngredients = async () => {
        try {
            const response = await axiosInstance.get(`/foods/ingredients/all`);
            const data = response.data.data;
            const options = data.map((item: any) => ({
                label: item.name,
                value: item.id,
            }));
            setIngredientOptions(options);
        } catch (error) {
            console.error("Error fetching ingredients: ", error);
        }
    };

    useEffect(() => {
        fetchIngredients();
    }, []);

    const handleAddFoodToPlan = async (food: typeof initialValues) => {
        try {
            const formattedFood = {
                food: {
                    name: food.name,
                    description: food.description,
                    price: Number(food.price),
                    image_url: food.image_url,
                    ingredients: food.ingredients.map((ing) => ({
                        ingredient_id: Number(ing.id),
                        quantity: Number(ing.quantity),
                    }))

                },
                plan_id: Number(selectedPlanId),
            };

            await axiosInstance.post("/food", formattedFood);
            router.back();
        } catch (err: any) {
            console.log(err);
            setError("Error al agregar comida. Intenta de nuevo.");
        }
    };


    const renderPage = (props: any) => {
        const { values, handleChange, handleBlur, touched, errors, setFieldValue } = props;

        switch (page) {
            case 0:
                return (
                    <>
                        <TextInput
                            label="Nombre de la comida"
                            value={values.name}
                            onChangeText={handleChange("name")}
                            onBlur={handleBlur("name")}
                            mode="outlined"
                            dense
                            error={touched.name && !!errors.name}
                            activeOutlineColor="#287D76"
                            outlineColor={touched.name && errors.name ? "red" : "#287D76"}
                        />
                        {touched.name && errors.name && <Text style={styles.error}>{errors.name}</Text>}

                        <TextInput
                            label="Descripción"
                            value={values.description}
                            onChangeText={handleChange("description")}
                            onBlur={handleBlur("description")}
                            mode="outlined"
                            dense
                            error={touched.description && !!errors.description}
                            activeOutlineColor="#287D76"
                            outlineColor={touched.description && errors.description ? "red" : "#287D76"}
                        />
                        {touched.description && errors.description && <Text style={styles.error}>{errors.description}</Text>}

                        <TextInput
                            label="Precio"
                            value={String(values.price)}
                            onChangeText={handleChange("price")}
                            onBlur={handleBlur("price")}
                            mode="outlined"
                            dense
                            keyboardType="numeric"
                            error={touched.price && !!errors.price}
                            activeOutlineColor="#287D76"
                            outlineColor={touched.price && errors.price ? "red" : "#287D76"}
                        />
                        {touched.price && errors.price && <Text style={styles.error}>{errors.price}</Text>}

                        <TextInput
                            label="URL de la imagen (opcional)"
                            value={values.image_url}
                            onChangeText={handleChange("image_url")}
                            onBlur={handleBlur("image_url")}
                            mode="outlined"
                            dense
                            error={touched.image_url && !!errors.image_url}
                            activeOutlineColor="#287D76"
                            outlineColor={touched.image_url && errors.image_url ? "red" : "#287D76"}
                        />
                        {touched.image_url && errors.image_url && (
                            <Text style={styles.error}>{errors.image_url}</Text>
                        )}
                    </>
                );
            case 1:
                return (
                    <>
                        <Text style={styles.sectionTitle}>Ingredientes</Text>

                        <CustomDropdown
                            label="Ingrediente"
                            options={ingredientOptions}
                            selected={selectedIngredient ? [selectedIngredient] : []}
                            onChange={(arr) => setSelectedIngredient(arr[0] ?? null)}
                            multiple={false}
                        />
                        <TextInput
                            label="Cantidad"
                            value={quantity}
                            onChangeText={setQuantity}
                            keyboardType="numeric"
                            mode="outlined"
                            dense
                            style={{ marginTop: 12 }}
                        />
                        <CustomDropdown
                            label="Unidad"
                            options={INGREDIENT_UNITS}
                            selected={[unit]}
                            onChange={(arr) => setUnit(arr[0] ?? "gram")}
                            multiple={false}
                        />

                        <TouchableOpacity
                            style={[styles.addButton, { marginTop: 16, alignSelf: "center" }]}
                            onPress={() => {
                                if (selectedIngredient && quantity.trim()) {
                                    const newIngredient = {
                                        id: selectedIngredient,
                                        quantity,
                                        unit,
                                    };
                                    setFieldValue("ingredients", [...values.ingredients, newIngredient]);
                                    setSelectedIngredient(null);
                                    setQuantity("");
                                    setUnit("gram");
                                }
                            }}
                        >
                            <Text style={styles.addButtonText}>+ Agregar ingrediente</Text>
                        </TouchableOpacity>

                        <View style={{ marginTop: 16 }}>
                            {values.ingredients.map((ingredient, idx) => {
                                const label = ingredientOptions.find(opt => opt.value === ingredient.id)?.label || "Ingrediente";
                                return (
                                    <View key={idx} style={styles.ingredientBadge}>
                                        <Text style={{ color: "#287D76", marginRight: 6 }}>
                                            {label} ({ingredient.quantity} {ingredient.unit})
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() =>
                                                setFieldValue(
                                                    "ingredients",
                                                    values.ingredients.filter((_, i) => i !== idx)
                                                )
                                            }
                                        >
                                            <Text style={{ color: "red", fontWeight: "bold" }}>×</Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </View>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <Header />
            <View style={styles.screenContainer}>
                <Text style={styles.title}>Agregar nueva comida</Text>
            </View>

            <Formik<FoodFormValues>
                initialValues={initialValues}
                validationSchema={createFoodValidationSchema}
                onSubmit={handleAddFoodToPlan}
            >
                {(props) => (
                    <>
                        <ScrollView
                            contentContainerStyle={[styles.screenContainer, { paddingBottom: 160 }]} // space for fixed buttons
                        >
                            <View style={{ gap: 20 }}>
                                {renderPage(props)}
                                {error && <Text style={styles.error}>{error}</Text>}
                            </View>
                        </ScrollView>

                        <View style={styles.fixedNavigation}>
                            <View style={styles.buttonRow}>
                                <View style={{ flexDirection: "row", justifyContent: "center", width: "100%"}}>
                                    {page > 0 && (
                                        <TouchableOpacity
                                            style={[
                                                styles.navButton,
                                                { backgroundColor: "#eee", borderColor: "#287D76", borderWidth: 1, marginRight: 10 },
                                            ]}
                                            onPress={() => setPage(page - 1)}
                                        >
                                            <Text style={{ color: "#287D76" }}>Atrás</Text>
                                        </TouchableOpacity>
                                    )}
                                    {page < 1 ? (
                                        <TouchableOpacity
                                            style={[styles.navButton, { backgroundColor: "#287D76" }]}
                                            onPress={() => setPage(page + 1)}
                                        >
                                            <Text style={{ color: "#fff" }}>Siguiente</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={[styles.navButton, { backgroundColor: "#287D76" }]}
                                            onPress={props.handleSubmit}
                                        >
                                            <Text style={{ color: "#fff" }}>Agregar</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </View>
                    </>
                )}
            </Formik>
        </View>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        paddingTop: 60,
        paddingHorizontal: 30,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        color: "#287D76",
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    sectionTitle: {
        fontWeight: "bold",
        fontSize: 16,
        color: "#287D76",
    },
    error: {
        color: "red",
        fontSize: 12,
        fontStyle: "italic",
    },
    ingredientBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E0F2F1",
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    addButton: {
        backgroundColor: "#287D76",
        borderRadius: 8,
        paddingHorizontal: 12,
        justifyContent: "center",
        alignItems: "center",
        padding: 6,
    },
    addButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
    },
    navigationButtons: {
        flexDirection: "row",
        justifyContent: "flex-start",
        gap: 10,
        marginTop: 20,
    },
    navButton: {
        borderRadius: 8,
        width: "48%",
        alignItems: "center",
        padding: 10,
    },
    formContainer: {
        paddingBottom: 30,
        paddingHorizontal: 30,
        backgroundColor: "#fff",
        flexGrow: 1,
    },
    fixedNavigation: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#ddd",
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    cancelButtonWrapper: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    cancelButton: {
        color: "red",
        fontSize: 16,
    },
    navButton: {
        borderRadius: 8,
        width: 140,
        alignItems: "center",
        padding: 10,
    },

});


export default CreateNewFood;
