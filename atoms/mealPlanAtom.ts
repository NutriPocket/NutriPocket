import { atom } from "jotai";

export const didFetchUserPlanAtom = atom(false);
export const selectedPlanIdAtom = atom<number | null>(null);