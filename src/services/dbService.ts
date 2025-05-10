// src/services/dbService.ts
import type { Document, Model, FilterQuery, UpdateQuery } from 'mongoose';

export class DbService<T extends Document> {
  constructor(protected model: Model<T>) {}

  create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  findAll(
    filter: FilterQuery<T>,
    opts: { skip?: number; limit?: number; sort?: any } = {}
  ): Promise<T[]> {
    return this.model
      .find(filter)
      .skip(opts.skip ?? 0)
      .limit(opts.limit ?? 0)
      .sort(opts.sort);
  }

  count(filter: FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(filter);
  }

  findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter);
  }

  updateOne(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>
  ): Promise<T | null> {
    return this.model.findOneAndUpdate(filter, update, { new: true });
  }

  deleteOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOneAndDelete(filter);
  }
}
