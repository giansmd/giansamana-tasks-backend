import type { IBlock } from "./Block.model.js";

export interface IProject {
  id: string;
  name: string;
  area_id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectWithBlocks extends IProject {
  blocks: IBlock[];
}

export type IProjectCreateDTO = Omit<
  IProject,
  "id" | "createdAt" | "updatedAt"
>;
export type IProjectUpdateDTO = Partial<IProjectCreateDTO> & Pick<IProject, "id">;
