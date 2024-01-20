import { Repository } from 'typeorm';

import { IEntity, TypeORMRepository } from '../../libs';
import { CatsTypeOrmSchema } from './schema';

type Model = CatsTypeOrmSchema & IEntity;

export class CatsTypeOrmRepository extends TypeORMRepository<CatsTypeOrmSchema> {
  constructor(readonly repository: Repository<Model>) {
    super(repository);
  }
}
