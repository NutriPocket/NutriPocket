import { atom } from 'jotai';

import { ObjectiveType } from '../types/anthropometricTypes';

export const objectivesAtom = atom<ObjectiveType | null>(null);
