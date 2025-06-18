import { atom } from "jotai";
import { IngredientPrincipalInfo } from "@/types/mealTypes";
export const consumedIngredientsAtom = atom<IngredientPrincipalInfo[]>([]);