import type {
  IBlock,
  IBlockCreateDTO,
  IBlockUpdateDTO,
} from "../../domain/models/Block.model.js";

export interface IBlockRepository {
  create(input: IBlockCreateDTO): Promise<IBlock>;
  update(input: IBlockUpdateDTO): Promise<IBlock>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<IBlock | null>;
  getAll(): Promise<IBlock[]>;
  getByProjectId(projectId: string): Promise<IBlock[]>;
}
