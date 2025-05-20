export type MealPlanType = {
    id_plan: string;
    title: string;
    objective: string;
    plan_description: string;
}

export type MealType = {
    id: string;
    name: string;
    description: string;
    price : number;
    created_at: string;
    //time: string;
//     calories: number;
//     proteins: number;
//     carbs: number;
//     fats: number;
// 
}

export type MealPlan = {
    id: string;
    title: string;
    description: string;
    mealsByDay: {
        [key: string]: MealType[];
    };
}

