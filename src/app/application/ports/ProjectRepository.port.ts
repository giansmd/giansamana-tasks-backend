import type {
  IProject,
  IProjectCreateDTO,
  IProjectUpdateDTO,
  IProjectWithBlocks,
} from "../../domain/models/Project.model.js";

export interface IProjectRepository {
  create(input: IProjectCreateDTO): Promise<IProject>;
  update(input: IProjectUpdateDTO): Promise<IProject>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<IProject | null>;
  getAll(): Promise<IProject[]>;
  getWithBlocks(id: string): Promise<IProjectWithBlocks | null>;
}
