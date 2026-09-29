import Exercise from '../models/Exercise.js';
import { httpError } from '../middleware/errorHandler.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function list(req, res) {
  const { muscleGroup, q } = req.query;
  const filter = {};
  if (muscleGroup) filter.muscleGroup = String(muscleGroup);
  if (q) filter.name = { $regex: escapeRegex(String(q)), $options: 'i' };
  res.json(await Exercise.find(filter).sort({ name: 1 }));
}

export async function get(req, res) {
  const exercise = await Exercise.findById(req.params.id);
  if (!exercise) throw httpError(404, 'Exercise not found');
  res.json(exercise);
}
