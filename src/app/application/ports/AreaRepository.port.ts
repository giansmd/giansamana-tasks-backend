import type {
  IArea,
  IAreaCreateDTO,
  IAreaUpdateDTO,
  IAreaWithProjects,
} from "../../domain/models/Area.model.js";

export interface IAreaRepository {
  create(payload: IAreaCreateDTO): Promise<IArea>;
  update(payload: IAreaUpdateDTO): Promise<IArea>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<IArea | null>;
  getAll(): Promise<IArea[]>;
  getWithProjects(id: string): Promise<IAreaWithProjects | null>;
}
