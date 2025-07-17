import mongoose from 'mongoose';

export interface IWorkSession {
  _id: string;
  freelancer: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  task?: string;
  module?: string;
  description?: string;
  status: 'active' | 'completed' | 'paused';
  earnings: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const workSessionSchema = new mongoose.Schema({
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
  },
  duration: {
    type: Number,
    default: 0,
  },
  task: {
    type: String,
    default: 'General Development',
  },
  module: {
    type: String,
    default: 'Bylukz',
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active',
  },
  earnings: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.WorkSession || mongoose.model('WorkSession', workSessionSchema);