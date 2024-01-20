import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Schema } from 'mongoose';

import { MongooseRepository } from '../../libs';
import { CatsMongooseDocument, CatsMongooseSchema, CatsSchema } from './schema';

const Model = mongoose.model<CatsMongooseDocument>(CatsSchema.name, CatsMongooseSchema as Schema);

export class UserRepository extends MongooseRepository<CatsMongooseDocument> {
  constructor(@InjectModel(CatsSchema.name) readonly entity: typeof Model) {
    super(entity);
  }
}
