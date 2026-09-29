import mongoose from 'mongoose';
import Program from '../models/Program.js';
import WorkoutLog from '../models/WorkoutLog.js';
import { httpError } from '../middleware/errorHandler.js';

const populateEntries = { path: 'entries.exercise' };
const own = (req) => ({ _id: req.params.id, user: req.user.id });

// Set i copies the last session's set i; extra sets repeat its last set.
// No history yet → the program's starting weight / reps.
export function buildPrefilledSets(targetSets, prevSets = [], { targetWeight = 0, targetReps = 0 } = {}) {
  return Array.from({ length: targetSets }, (_, i) => {
    const prev = prevSets[i] ?? prevSets.at(-1);
    return { weight: prev?.weight ?? targetWeight ?? 0, reps: prev?.reps ?? targetReps ?? 0, completed: false };
  });
}

// exerciseId → completed sets from the most recent finished workout containing it (any program).
async function lastPerformance(userId, exerciseIds) {
  const logs = await WorkoutLog.find({ user: userId, status: 'completed', 'entries.exercise': { $in: exerciseIds } })
    .sort({ startedAt: -1 })
    .limit(50)
    .select('entries')
    .lean();
  const wanted = new Set(exerciseIds.map(String));
  const found = new Map();
  for (const log of logs) {
    for (const entry of log.entries) {
      const id = String(entry.exercise);
      if (!wanted.has(id) || found.has(id)) continue;
      const done = entry.sets.filter((s) => s.completed && (s.weight > 0 || s.reps > 0));
      if (done.length) found.set(id, done);
    }
    if (found.size === wanted.size) break;
  }
  return found;
}

export async function start(req, res) {
  const { programId } = req.body;
  if (!mongoose.isValidObjectId(programId)) throw httpError(400, 'programId is required');
  const program = await Program.findOne({ _id: programId, user: req.user.id });
  if (!program) throw httpError(404, 'Program not found');

  const previous = await lastPerformance(req.user.id, program.exercises.map((e) => e.exercise));
  const entries = [...program.exercises]
    .sort((a, b) => a.order - b.order)
    .map((e) => ({
      exercise: e.exercise,
      sets: buildPrefilledSets(e.targetSets, previous.get(String(e.exercise)), e),
    }));

  const log = await WorkoutLog.create({ user: req.user.id, program: program._id, programName: program.name, entries });
  res.status(201).json(await log.populate(populateEntries));
}

export async function list(req, res) {
  const { status } = req.query;
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const filter = { user: req.user.id };
  if (status) filter.status = String(status);
  res.json(await WorkoutLog.find(filter).sort({ startedAt: -1 }).limit(limit).populate(populateEntries));
}

export async function get(req, res) {
  const log = await WorkoutLog.findOne(own(req)).populate(populateEntries);
  if (!log) throw httpError(404, 'Workout log not found');
  res.json(log);
}

export async function update(req, res) {
  const log = await WorkoutLog.findOne(own(req));
  if (!log) throw httpError(404, 'Workout log not found');
  const { entries, notes } = req.body;
  if (Array.isArray(entries)) {
    log.entries = entries.map((e) => ({
      exercise: e.exercise?._id ?? e.exercise,
      sets: (e.sets ?? []).map(({ weight, reps, completed }) => ({ weight, reps, completed })),
    }));
  }
  if (notes !== undefined) log.notes = notes;
  await log.save();
  res.json(await log.populate(populateEntries));
}

export async function finish(req, res) {
  const log = await WorkoutLog.findOne(own(req));
  if (!log) throw httpError(404, 'Workout log not found');
  log.status = 'completed';
  log.finishedAt = new Date();
  await log.save();
  res.json(await log.populate(populateEntries));
}

export async function remove(req, res) {
  const log = await WorkoutLog.findOneAndDelete(own(req));
  if (!log) throw httpError(404, 'Workout log not found');
  res.status(204).end();
}
