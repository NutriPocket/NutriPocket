import { atom } from "jotai";
import { IngredientType } from "@/types/mealTypes";
export const consumedIngredientsAtom = atom<IngredientType[]>([]);