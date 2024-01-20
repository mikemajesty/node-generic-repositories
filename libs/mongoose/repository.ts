import {
  Document,
  FilterQuery,
  Model,
  QueryOptions,
  SaveOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline
} from 'mongoose';
import { InsertManyOptions } from 'mongoose';

import { IRepository } from '../adapter';
import { IEntity } from '../entity';
import { CreatedModel, CreatedOrUpdateModel, DatabaseOperationCommand, RemovedModel, UpdatedModel } from '../types';
import { validateFindByCommandsFilter } from '../utils';

export class MongooseRepository<T extends Document> implements IRepository<T> {
  constructor(private readonly model: Model<T>) {}

  async insertMany<TOptions = unknown>(documents: T[], saveOptions?: TOptions): Promise<void> {
    await this.model.insertMany(documents, saveOptions as InsertManyOptions);
  }

  async create<TOptions = SaveOptions>(document: T, saveOptions?: TOptions): Promise<CreatedModel> {
    const createdEntity = new this.model({ ...document, _id: document.id });
    const savedResult = await createdEntity.save(saveOptions as SaveOptions);

    return { id: savedResult.id, created: !!savedResult.id };
  }

  async createOrUpdate<TDocument = IEntity, TOptions = QueryOptions>(
    document: TDocument,
    options?: TOptions
  ): Promise<CreatedOrUpdateModel> {
    const documentEntity: IEntity = document as IEntity;
    if (!documentEntity?.id) {
      throw new Error('id is required');
    }

    const exists = await this.findById(documentEntity?.id);

    if (!exists) {
      const createdEntity = new this.model({ ...document, _id: documentEntity?.id });
      const savedResult = await createdEntity.save(options as QueryOptions);

      return { id: savedResult.id, created: true, updated: false };
    }

    await this.model.updateOne(
      { _id: exists.id },
      document as UpdateWithAggregationPipeline | UpdateQuery<T>,
      options as QueryOptions
    );

    return { id: exists.id, created: false, updated: true };
  }

  async find<TQuery = FilterQuery<T>, TOptions = QueryOptions>(filter: TQuery, options?: TOptions): Promise<T[]> {
    return (await this.model.find(filter as FilterQuery<T>, undefined, options as QueryOptions)).map((u) =>
      u.toObject({ virtuals: true })
    );
  }

  async findById(id: string | number): Promise<T | null> {
    const model = await this.model.findById(id);

    if (!model) return null;

    return model.toObject({ virtuals: true });
  }

  async findOne<TQuery = FilterQuery<T>, TOptions = QueryOptions>(
    filter: TQuery,
    options?: TOptions
  ): Promise<T | null> {
    const data = await this.model.findOne(filter as FilterQuery<T>, undefined, options as QueryOptions);

    if (!data) return null;

    return data.toObject({ virtuals: true });
  }

  async findAll<TQuery = FilterQuery<T>>(filter?: TQuery): Promise<T[]> {
    const modelList = await this.model.find(filter as FilterQuery<T>);

    return (modelList || []).map((u) => u.toObject({ virtuals: true }));
  }

  async remove<TQuery = FilterQuery<T>>(filter: TQuery): Promise<RemovedModel> {
    const { deletedCount } = await this.model.deleteOne(filter as FilterQuery<T>);
    return { deletedCount, deleted: !!deletedCount };
  }

  async updateOne<
    TQuery = FilterQuery<T>,
    TUpdate = UpdateWithAggregationPipeline | UpdateQuery<T>,
    TOptions = QueryOptions
  >(filter: TQuery, updated: TUpdate, options?: TOptions): Promise<UpdatedModel> {
    return await this.model.updateOne(
      filter as FilterQuery<T>,
      updated as UpdateWithAggregationPipeline | UpdateQuery<T>,
      options as QueryOptions
    );
  }

  async findOneAndUpdate<
    TQuery = FilterQuery<T>,
    TUpdate = UpdateWithAggregationPipeline | UpdateQuery<T>,
    TOptions = QueryOptions
  >(filter: TQuery, updated: TUpdate, options: TOptions): Promise<T | null> {
    const model = await this.model.findOneAndUpdate(
      filter as FilterQuery<T>,
      updated as UpdateWithAggregationPipeline | UpdateQuery<T>,
      { new: true, ...options } as QueryOptions
    );

    if (!model) {
      return null;
    }

    return model.toObject({ virtuals: true });
  }

  async updateMany<
    TQuery = FilterQuery<T>,
    TUpdate = UpdateWithAggregationPipeline | UpdateQuery<T>,
    TOptions = QueryOptions
  >(filter: TQuery, updated: TUpdate, options: TOptions): Promise<UpdatedModel> {
    return await this.model.updateMany(
      filter as FilterQuery<T>,
      updated as UpdateWithAggregationPipeline | UpdateQuery<T>,
      options as QueryOptions
    );
  }

  async findIn<TOptions = QueryOptions>(input: { [key in keyof T]: string[] }, options?: TOptions): Promise<T[]> {
    const key = Object.keys(input)[0];
    const inputKey = key === 'id' ? '_id' : key;
    const filter = { [key]: { $in: input[inputKey as keyof T] }, deletedAt: null };
    return await this.model.find(filter, null, options as QueryOptions);
  }

  async findByCommands<TOptions = QueryOptions>(
    filterList: DatabaseOperationCommand<T>[],
    options?: TOptions
  ): Promise<T[]> {
    const mongoSearch = {
      equal: { type: '$in', like: false },
      not_equal: { type: '$nin', like: false },
      not_contains: { type: '$nin', like: true },
      contains: { type: '$in', like: true }
    };

    const searchList = {};

    validateFindByCommandsFilter(filterList);

    for (const filter of filterList) {
      const command = mongoSearch[filter.command];

      if (command.like) {
        Object.assign(searchList, {
          [filter.property]: { [command.type]: filter.value.map((value) => new RegExp(`^${value}`, 'i')) }
        });
        continue;
      }

      Object.assign(searchList, { [filter.property]: { [command.type]: filter.value } });
    }

    Object.assign(searchList, { deletedAt: null });

    const data = await this.model.find(searchList, null, options as QueryOptions);

    return data.map((d) => d.toObject({ virtuals: true }));
  }

  async findOneWithExcludeFields<TQuery = FilterQuery<T>, TOptions = QueryOptions>(
    filter: TQuery,
    excludeProperties: Array<keyof T>,
    options?: TOptions
  ): Promise<T | null> {
    const exclude = excludeProperties.map((e) => `-${e.toString()}`);

    const data = await this.model
      .findOne(filter as FilterQuery<T>, undefined, options as QueryOptions)
      .select(exclude.join(' '));

    if (!data) return null;

    return data.toObject({ virtuals: true });
  }

  async findAllWithExcludeFields<TQuery = FilterQuery<T>, TOptions = QueryOptions>(
    excludeProperties: Array<keyof T>,
    filter?: TQuery,
    options?: TOptions
  ): Promise<T[]> {
    const exclude = excludeProperties.map((e) => `-${e.toString()}`);

    const where = this.applyFilterWhenFilterParameterIsNotFirstOption(filter as FilterQuery<T>);

    const data = await this.model
      .find(where as FilterQuery<T>, undefined, options as QueryOptions)
      .select(exclude.join(' '));

    return data.map((d) => d.toObject({ virtuals: true }));
  }

  async findOneWithSelectFields<TQuery = Partial<T>, TOptions = unknown>(
    filter: TQuery,
    includeProperties: Array<keyof T>,
    options?: TOptions
  ): Promise<T | null> {
    const exclude = includeProperties.map((e) => `${e.toString()}`);

    const data = await this.model
      .findOne(filter as FilterQuery<T>, undefined, options as QueryOptions)
      .select(exclude.join(' '));

    if (!data) return null;

    return data.toObject({ virtuals: true });
  }

  async findAllWithSelectFields<TQuery = FilterQuery<T>, TOptions = QueryOptions>(
    includeProperties: Array<keyof T>,
    filter?: TQuery,
    options?: TOptions
  ): Promise<T[]> {
    const exclude = includeProperties.map((e) => `${e.toString()}`);

    const where = this.applyFilterWhenFilterParameterIsNotFirstOption(filter as FilterQuery<T>);

    const data = await this.model
      .find(where as FilterQuery<T>, undefined, options as QueryOptions)
      .select(exclude.join(' '));

    return data.map((d) => d.toObject({ virtuals: true }));
  }

  private applyFilterWhenFilterParameterIsNotFirstOption(filter: FilterQuery<T>) {
    if (!filter) {
      filter = { deletedAt: null };
    }

    if (filter?.id) {
      filter._id = filter.id;
      delete filter.id;
    }

    return filter;
  }
}
