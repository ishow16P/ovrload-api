import Program from '../models/Program.js';
import { httpError } from '../middleware/errorHandler.js';

const populateExercises = { path: 'exercises.exercise' };

// Normalise client payload → ordered exercise refs. `user` never comes from the body.
function pick(body) {
  const { name, description, exercises } = body;
  return {
    name,
    description,
    exercises: Array.isArray(exercises)
      ? exercises.map((e, i) => ({ exercise: e.exercise, targetSets: e.targetSets, targetWeight: e.targetWeight, targetReps: e.targetReps, order: i }))
      : undefined,
  };
}

const own = (req) => ({ _id: req.params.id, user: req.user.id });

export async function list(req, res) {
  res.json(await Program.find({ user: req.user.id }).sort({ updatedAt: -1 }).populate(populateExercises));
}

export async function get(req, res) {
  const program = await Program.findOne(own(req)).populate(populateExercises);
  if (!program) throw httpError(404, 'Program not found');
  res.json(program);
}

export async function create(req, res) {
  const program = await Program.create({ ...pick(req.body), user: req.user.id });
  res.status(201).json(await program.populate(populateExercises));
}

export async function update(req, res) {
  const program = await Program.findOne(own(req));
  if (!program) throw httpError(404, 'Program not found');
  const data = pick(req.body);
  for (const [k, v] of Object.entries(data)) if (v !== undefined) program[k] = v;
  await program.save();
  res.json(await program.populate(populateExercises));
}

export async function remove(req, res) {
  const program = await Program.findOneAndDelete(own(req));
  if (!program) throw httpError(404, 'Program not found');
  res.status(204).end();
}
