import type { IProject } from "./Project.model.js";

export interface IArea {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAreaWithProjects extends IArea {
  projects: IProject[];
}

export type IAreaCreateDTO = Omit<IArea, "id" | "createdAt" | "updatedAt">;
export type IAreaUpdateDTO = Partial<IAreaCreateDTO> & Pick<IArea, "id">;
