export interface IBlock {
  id: string;
  title: string;
  completed: boolean;
  project_id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type IBlockCreateDTO = Omit<IBlock, 'id' | 'createdAt' | 'updatedAt'>;
export type IBlockUpdateDTO = Partial<IBlockCreateDTO> & Pick<IBlock, 'id'>;
export type IBlockDeleteDTO = Pick<IBlock, 'id'>;
