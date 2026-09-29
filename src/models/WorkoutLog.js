import mongoose from 'mongoose';

const setSchema = new mongoose.Schema(
  {
    weight: { type: Number, min: 0, default: 0 }, // kg
    reps: {
      type: Number,
      min: 0,
      default: 0,
      validate: { validator: Number.isInteger, message: 'Reps must be an integer' },
    },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const entrySchema = new mongoose.Schema({
  exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
  sets: { type: [setSchema], default: [] },
});

const workoutLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
    programName: { type: String, trim: true, default: '' }, // snapshot, survives program delete
    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    entries: { type: [entrySchema], default: [] },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

workoutLogSchema.index({ user: 1, startedAt: -1 });

export default mongoose.model('WorkoutLog', workoutLogSchema);
