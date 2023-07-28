import { Schema, Types, model } from "mongoose";
const taskSchema = new Schema(
  {
    //title
    title: String,
    //description
    description: String,
    //status
    status: {
      type: String,
      enum: ["toDo", "doing", "done"],
      default: "toDo",
    },
    //isDeleted
    isDeleted: { type: Boolean, default: false },
    // userId
    userId: {
      type: Types.ObjectId,
      ref: "User",
    },
    //assignTo
    assignTo: {
      type: Types.ObjectId,
      ref: "User",
    },
    //deadline
    deadline: Date,
    //attachment
    attachment: [String],
  },
  { timestamps: true }
);
const taskModel = model("Task", taskSchema);
export default taskModel;
