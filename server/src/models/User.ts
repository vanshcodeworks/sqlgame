import mongoose, { Document, Schema } from 'mongoose'

export type UserRole     = 'user' | 'admin'
export type UserIdentity = 'rookie' | 'engineer' | 'agent'
export type UserTempo    = 'scout'  | 'agent'    | 'elite'

export interface IUser extends Document {
  supabaseId:         string
  email:              string
  displayName:        string
  identity:           UserIdentity
  tempo:              UserTempo
  onboardingComplete: boolean
  arcAccess:          number[]   // e.g. [1, 2, 3]
  role:               UserRole
  createdAt:          Date
  updatedAt:          Date
}

const userSchema = new Schema<IUser>(
  {
    supabaseId:         { type: String, required: true, unique: true, index: true },
    email:              { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayName:        { type: String, default: '' },
    identity:           { type: String, enum: ['rookie', 'engineer', 'agent'], default: 'rookie' },
    tempo:              { type: String, enum: ['scout', 'agent', 'elite'],    default: 'agent' },
    onboardingComplete: { type: Boolean, default: false },
    arcAccess:          { type: [Number], default: [1, 2, 3] },
    role:               { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
)

export const User = mongoose.model<IUser>('User', userSchema)
