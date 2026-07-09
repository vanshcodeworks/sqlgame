import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IProgress extends Document {
  userId:          Types.ObjectId
  xp:              number
  streak:          number
  lastPlayedDate:  string | null
  completedLevels: number[]
}

const progressSchema = new Schema<IProgress>({
  userId:          { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  xp:              { type: Number, default: 0 },
  streak:          { type: Number, default: 0 },
  lastPlayedDate:  { type: String, default: null },
  completedLevels: { type: [Number], default: [] },
})

export const Progress = mongoose.model<IProgress>('Progress', progressSchema)
