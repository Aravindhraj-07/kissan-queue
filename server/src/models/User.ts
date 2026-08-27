import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'FARMER' | 'STORAGE_AUTHORITY' | 'LOGISTICS' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface IUser extends Document {
  name: string;
  phone: string;
  email?: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true, sparse: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['FARMER', 'STORAGE_AUTHORITY', 'LOGISTICS', 'ADMIN'],
      required: true,
      default: 'FARMER',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
    },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
