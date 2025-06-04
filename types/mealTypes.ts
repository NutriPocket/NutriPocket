export type MealPlanType = {
    id_plan: number;
    title: string;
    objective: string;
    plan_description: string;
}

export type MealType = {
    id: number;
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fiber: number;
    saturated_fats: number;
    monounsaturated_fats: number;
    polyunsaturated_fats: number;
    trans_fats: number;
    cholesterol: number;
    image_url: string;
    price: number;
}

export type IngredientType = {
    id: number;
    name : string;
    measure_type: string;
    calories: number;
    protein: number;
    carbs: number;
    fiber: number;
    saturated_fats: number;
    monounsaturated_fats: number;
    polyunsaturated_fats: number;
    trans_fats: number;
    cholesterol: number;
    quantity: number;
}

export type ItineraryPlan = {
    id_plan: string;
    title: string;
    plan_description: string;
    objective: string;
    weekly_plan: {
        [weekDay: string]: {
            [momentDay: string]: MealType | null;
        };
    };
}

export type MealPlan = {
    id: string;
    title: string;
    description: string;
    mealsByDay: {
        [key: string]: MealType[];
    };
}

