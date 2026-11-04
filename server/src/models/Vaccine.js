
import mongoose from "mongoose";

const vaccineSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    vaccineName: {
      type: String,
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    doseNumber: {
      type: Number,
      default: 1
    },
    notes: {
      type: String,
      default: ""
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Vaccine = mongoose.model("Vaccine", vaccineSchema);

export default Vaccine;
