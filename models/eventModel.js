const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
    default: "Online", 
  },
  category: {
    type: String,
    enum: ["Technology", "Music", "Art", "Sports", "Business", "Education"],
    default: "Technology",
  },
  capacity: {
    type: Number,
    default: 100,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    },
  attendees: [
    { type: String }
  ],
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
