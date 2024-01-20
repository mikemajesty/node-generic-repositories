import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { IEntity } from '../../libs';

export type CatsMongooseDocument = Document & IEntity;

@Schema({
  collection: 'cats-collection',
  autoIndex: true,
  timestamps: true
})
export class CatsSchema {
  @Prop({ type: String })
  _id: string;

  @Prop({ min: 0, max: 200, required: true, type: String })
  name: string;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

const CatsMongooseSchema = SchemaFactory.createForClass(CatsSchema);

export { CatsMongooseSchema };
