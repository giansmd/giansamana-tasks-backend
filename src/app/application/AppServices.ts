import type {
  IAreaRepository,
  IBlockRepository,
  IProjectRepository,
} from "./ports/index.js";

export type RepositoryAdapters = {
  area: IAreaRepository;
  project: IProjectRepository;
  block: IBlockRepository;
};

export class AppServices {
  constructor(private readonly adapters: RepositoryAdapters) {}

  get area(): IAreaRepository {
    return this.adapters.area;
  }

  get project(): IProjectRepository {
    return this.adapters.project;
  }

  get block(): IBlockRepository {
    return this.adapters.block;
  }
}
