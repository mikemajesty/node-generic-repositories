import { ModelCtor } from 'sequelize-typescript';

import { IEntity, SequelizeRepository } from '../../libs';
import { CatsSequelizeSchema } from './schema';

type Model = ModelCtor<CatsSequelizeSchema> & IEntity;

export class CatsRepository extends SequelizeRepository<Model> {
  constructor(readonly repository: Model) {
    super(repository);
  }
}
