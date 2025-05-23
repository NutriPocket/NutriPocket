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
}


export type ItineraryPlan = {
    id_plan: string;
    title: string;
    plan_description: string;
    objective: string;
    weekly_plan: {
        [weekDay: string]: {
            [momentDay: string]: MealType;
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

