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

export interface IAreaResponse {
  success: boolean;
  data: IArea;
  message?: string;
}

export interface IAreasListResponse {
  success: boolean;
  data: IArea[];
  total: number;
  message?: string;
}

export interface IAreaWithProjectsResponse {
  success: boolean;
  data: IAreaWithProjects;
  message?: string;
}
