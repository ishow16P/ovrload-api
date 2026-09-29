import mongoose from 'mongoose';

const programExerciseSchema = new mongoose.Schema(
  {
    exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
    order: { type: Number, default: 0 },
    targetSets: { type: Number, min: 1, max: 20, default: 3 },
    targetWeight: { type: Number, min: 0, max: 1000, default: 0 }, // kg, starting load before any history
    targetReps: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      validate: { validator: Number.isInteger, message: 'Reps must be an integer' },
    },
  },
  { _id: false }
);

const programSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    exercises: {
      type: [programExerciseSchema],
      validate: { validator: (v) => v.length > 0, message: 'Program needs at least one exercise' },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Program', programSchema);
