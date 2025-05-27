import { RoutineType } from "./routineType";

export type GroupType = {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  routines: RoutineType[];
  created_at: string;
  updated_at: string;
};
