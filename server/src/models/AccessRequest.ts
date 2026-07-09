import mongoose, { Document, Schema, Types } from 'mongoose'

export type RequestStatus = 'pending' | 'approved' | 'rejected'

export interface IAccessRequest extends Document {
  userId:     Types.ObjectId
  arcId:      number
  status:     RequestStatus
  message:    string  // user's motivation message
  adminNote:  string
  createdAt:  Date
  updatedAt:  Date
}

const accessRequestSchema = new Schema<IAccessRequest>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    arcId:     { type: Number, required: true },
    status:    { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    message:   { type: String, default: '' },
    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
)

// One pending request per (user, arc) pair
accessRequestSchema.index({ userId: 1, arcId: 1 }, { unique: true })

export const AccessRequest = mongoose.model<IAccessRequest>('AccessRequest', accessRequestSchema)
