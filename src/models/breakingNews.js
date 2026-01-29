const mongoose = require("mongoose");

const breakingNewsSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    headline: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    priority: { type: Number, default: 0 },
    startTime: { type: Date, required: true, default: Date.now },
    endTime: { type: Date, required: true },
    isPushNotificationSent: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Active", "Expired", "Scheduled"],
      default: "Active",
    },
  },
  { timestamps: true },
);

breakingNewsSchema.pre("save", async function () {
  const now = new Date();
  if (now > this.endTime) {
    this.status = "Expired";
  } else if (now < this.startTime) {
    this.status = "Scheduled";
  } else {
    this.status = "Active";
  }
});
module.exports = mongoose.model("BreakingNews", breakingNewsSchema);
