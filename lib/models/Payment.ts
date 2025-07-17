import mongoose from 'mongoose';

export interface IPayment {
  _id: string;
  freelancer: string;
  amount: number;
  hoursWorked: number;
  period: {
    start: Date;
    end: Date;
  };
  status: 'pending' | 'paid' | 'cancelled';
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new mongoose.Schema({
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  hoursWorked: {
    type: Number,
    required: true,
  },
  period: {
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending',
  },
  paidAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);