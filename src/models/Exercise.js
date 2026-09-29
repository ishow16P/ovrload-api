import mongoose from 'mongoose';

export const MUSCLE_GROUPS = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'glutes', 'calves', 'core', 'full-body'];
export const EQUIPMENT = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell', 'ez-bar', 'smith-machine'];

const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    muscleGroup: { type: String, enum: MUSCLE_GROUPS, required: true },
    equipment: { type: String, enum: EQUIPMENT, required: true },
    description: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Exercise', exerciseSchema);
