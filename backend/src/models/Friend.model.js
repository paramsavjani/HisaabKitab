import mongoose, { Schema } from "mongoose";

const friendSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    friendId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    lastTransactionTime: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Friend = mongoose.model("Friend", friendSchema);
