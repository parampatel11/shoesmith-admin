import mongoose from "mongoose";

const TipSchema = new mongoose.Schema(
  {
    name: String,
    amount: Number,
    note: String,
  },
  { timestamps: true }
);

const Tip = mongoose.models.Tip || mongoose.model("Tip", TipSchema);

export default Tip;
