import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: "admin" | "freelancer";
  hourlyRate?: number;
  profileImage?: string;
  skills?: string[];
  joinedAt: Date;
  isActive: boolean;
  totalHoursWorked?: number;
  totalEarnings?: number;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "freelancer"],
      required: true,
    },
    hourlyRate: {
      type: Number,
      default: 25,
    },
    profileImage: {
      type: String,
      default: "",
    },
    skills: [
      {
        type: String,
      },
    ],
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalHoursWorked: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error('Unknown error occurred'));
    }
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model("User", userSchema);
