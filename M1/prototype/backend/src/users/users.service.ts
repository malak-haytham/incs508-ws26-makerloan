import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly model: Model<UserDocument>) {}

  findById(id: string) {
    return this.model.findById(id).exec();
  }
  findByEmailWithSecrets(email: string) {
    return this.model.findOne({ email: email.toLowerCase() }).select('+passwordHash').exec();
  }
  findByIdWithRefresh(id: string) {
    return this.model.findById(id).select('+refreshTokenHash').exec();
  }
  setRefreshHash(id: string, hash: string | null) {
    return this.model.updateOne({ _id: id }, hash ? { refreshTokenHash: hash } : { $unset: { refreshTokenHash: 1 } }).exec();
  }
  /** F5 owner: flips the flag after a briefing is recorded. */
  setSafetyCertified(id: string, value: boolean) {
    return this.model.findByIdAndUpdate(id, { safetyCertified: value }, { new: true }).exec();
  }
  create(data: Partial<User>) {
    return this.model.create(data);
  }
}
