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
    calories_per_100g: number;
    protein_per_100g: number;
    carbohydrates_per_100g: number;
    fiber_per_100g: number;
    saturated_fats_per_100g: number;
    monounsaturated_fats_per_100g: number;
    polyunsaturated_fats_per_100g: number;
    trans_fats_per_100g: number;
    cholesterol_per_100g: number;
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

