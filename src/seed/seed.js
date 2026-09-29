import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Exercise from '../models/Exercise.js';

// [name, muscleGroup, equipment, description]
const exercises = [
  // Chest
  ['Bench Press', 'chest', 'barbell', 'Flat barbell press for chest, shoulders and triceps.'],
  ['Incline Bench Press', 'chest', 'barbell', 'Barbell press on an incline bench for upper chest.'],
  ['Decline Bench Press', 'chest', 'barbell', 'Barbell press on a decline bench for lower chest.'],
  ['Dumbbell Bench Press', 'chest', 'dumbbell', 'Flat press with dumbbells for a deeper range of motion.'],
  ['Incline Dumbbell Press', 'chest', 'dumbbell', 'Upper-chest focused press on an incline bench.'],
  ['Dumbbell Fly', 'chest', 'dumbbell', 'Wide-arc isolation move to stretch and squeeze the chest.'],
  ['Cable Crossover', 'chest', 'cable', 'Standing cable fly with constant tension across the chest.'],
  ['Chest Dip', 'chest', 'bodyweight', 'Forward-leaning dip that loads the lower chest.'],
  ['Push-Up', 'chest', 'bodyweight', 'Bodyweight press — chest, shoulders, triceps and core.'],
  ['Machine Chest Press', 'chest', 'machine', 'Guided press, easy to push close to failure safely.'],
  ['Pec Deck', 'chest', 'machine', 'Machine fly for chest isolation.'],
  // Back
  ['Deadlift', 'back', 'barbell', 'Hip hinge pulling the bar from the floor — posterior chain king.'],
  ['Barbell Row', 'back', 'barbell', 'Bent-over row for mid-back thickness.'],
  ['Pendlay Row', 'back', 'barbell', 'Strict row from a dead stop on the floor each rep.'],
  ['Dumbbell Row', 'back', 'dumbbell', 'Single-arm row braced on a bench.'],
  ['Pull-Up', 'back', 'bodyweight', 'Overhand vertical pull for lats and upper back.'],
  ['Chin-Up', 'back', 'bodyweight', 'Underhand vertical pull with more biceps involvement.'],
  ['Lat Pulldown', 'back', 'cable', 'Cable vertical pull, a scalable pull-up alternative.'],
  ['Seated Cable Row', 'back', 'cable', 'Horizontal cable pull for mid-back and lats.'],
  ['T-Bar Row', 'back', 'barbell', 'Landmine-style row for heavy back work.'],
  ['Straight-Arm Pulldown', 'back', 'cable', 'Lat isolation with arms kept straight.'],
  ['Face Pull', 'back', 'cable', 'Rope pull to the face for rear delts and upper back health.'],
  ['Back Extension', 'back', 'bodyweight', 'Hyperextension for lower back and glutes.'],
  // Shoulders
  ['Overhead Press', 'shoulders', 'barbell', 'Standing strict barbell press overhead.'],
  ['Seated Dumbbell Press', 'shoulders', 'dumbbell', 'Seated overhead press with dumbbells.'],
  ['Arnold Press', 'shoulders', 'dumbbell', 'Rotating dumbbell press that hits all three delt heads.'],
  ['Lateral Raise', 'shoulders', 'dumbbell', 'Side raise for wider-looking shoulders.'],
  ['Cable Lateral Raise', 'shoulders', 'cable', 'Single-arm side raise with constant cable tension.'],
  ['Front Raise', 'shoulders', 'dumbbell', 'Raise to the front for anterior delts.'],
  ['Rear Delt Fly', 'shoulders', 'dumbbell', 'Bent-over reverse fly for rear delts.'],
  ['Upright Row', 'shoulders', 'barbell', 'Vertical pull to the chest for delts and traps.'],
  ['Barbell Shrug', 'shoulders', 'barbell', 'Heavy shrug for upper traps.'],
  ['Dumbbell Shrug', 'shoulders', 'dumbbell', 'Shrug with dumbbells at your sides for traps.'],
  // Biceps
  ['Barbell Curl', 'biceps', 'barbell', 'Classic biceps mass builder.'],
  ['EZ-Bar Curl', 'biceps', 'ez-bar', 'Curl with an angled bar — easier on the wrists.'],
  ['Dumbbell Curl', 'biceps', 'dumbbell', 'Alternating or simultaneous dumbbell curls.'],
  ['Hammer Curl', 'biceps', 'dumbbell', 'Neutral-grip curl for brachialis and forearms.'],
  ['Preacher Curl', 'biceps', 'ez-bar', 'Curl on a preacher pad to strictly isolate biceps.'],
  ['Incline Dumbbell Curl', 'biceps', 'dumbbell', 'Curl lying on an incline for a long-head stretch.'],
  ['Cable Curl', 'biceps', 'cable', 'Curl with constant tension from the cable stack.'],
  // Triceps
  ['Tricep Pushdown', 'triceps', 'cable', 'Cable extension pushing down for triceps.'],
  ['Overhead Tricep Extension', 'triceps', 'dumbbell', 'Overhead extension for the triceps long head.'],
  ['Skull Crusher', 'triceps', 'ez-bar', 'Lying extension lowering the bar toward the forehead.'],
  ['Close-Grip Bench Press', 'triceps', 'barbell', 'Narrow-grip bench press that shifts load to triceps.'],
  ['Tricep Dip', 'triceps', 'bodyweight', 'Upright dip on bars or a bench for triceps.'],
  // Legs
  ['Squat', 'legs', 'barbell', 'Back squat — king of lower-body lifts.'],
  ['Front Squat', 'legs', 'barbell', 'Bar racked in front, more quads and upright torso.'],
  ['Leg Press', 'legs', 'machine', 'Machine press for heavy quad and glute work.'],
  ['Hack Squat', 'legs', 'machine', 'Machine squat on a sled for quad focus.'],
  ['Bulgarian Split Squat', 'legs', 'dumbbell', 'Rear-foot-elevated single-leg squat.'],
  ['Walking Lunge', 'legs', 'dumbbell', 'Alternating forward lunges while walking.'],
  ['Goblet Squat', 'legs', 'dumbbell', 'Squat holding a dumbbell at the chest.'],
  ['Leg Extension', 'legs', 'machine', 'Machine knee extension for quad isolation.'],
  ['Romanian Deadlift', 'legs', 'barbell', 'Hip hinge with soft knees for hamstrings and glutes.'],
  ['Lying Leg Curl', 'legs', 'machine', 'Prone machine curl for hamstrings.'],
  ['Seated Leg Curl', 'legs', 'machine', 'Seated machine curl for hamstrings.'],
  // Glutes
  ['Hip Thrust', 'glutes', 'barbell', 'Back on a bench, drive the bar up with your hips.'],
  ['Glute Bridge', 'glutes', 'bodyweight', 'Floor hip bridge for glute activation.'],
  ['Cable Kickback', 'glutes', 'cable', 'Single-leg kickback with an ankle strap.'],
  ['Sumo Deadlift', 'glutes', 'barbell', 'Wide-stance deadlift with more glutes and adductors.'],
  // Calves
  ['Standing Calf Raise', 'calves', 'machine', 'Straight-knee calf raise for gastrocnemius.'],
  ['Seated Calf Raise', 'calves', 'machine', 'Bent-knee calf raise for soleus.'],
  // Core
  ['Plank', 'core', 'bodyweight', 'Isometric hold — log time in seconds as reps.'],
  ['Hanging Leg Raise', 'core', 'bodyweight', 'Hang from a bar and raise your legs.'],
  ['Cable Crunch', 'core', 'cable', 'Kneeling crunch against a cable rope.'],
  ['Ab Wheel Rollout', 'core', 'bodyweight', 'Roll out and back with an ab wheel.'],
  ['Russian Twist', 'core', 'bodyweight', 'Seated rotation for obliques, add a plate to load it.'],
  // Full body
  ['Power Clean', 'full-body', 'barbell', 'Explosive pull from the floor to the front rack.'],
  ['Kettlebell Swing', 'full-body', 'kettlebell', 'Explosive hip hinge swinging the bell to chest height.'],
  ["Farmer's Carry", 'full-body', 'dumbbell', 'Walk holding heavy weights — grip and core.'],
  ['Thruster', 'full-body', 'barbell', 'Front squat straight into an overhead press.'],
].map(([name, muscleGroup, equipment, description]) => ({ name, muscleGroup, equipment, description }));

async function seed() {
  await connectDB();
  const ops = exercises.map((e) => ({
    updateOne: { filter: { name: e.name }, update: { $set: e }, upsert: true },
  }));
  const result = await Exercise.bulkWrite(ops);
  // Drop exercises that are no longer part of the master list
  const removed = await Exercise.deleteMany({ name: { $nin: exercises.map((e) => e.name) } });
  console.log(
    `Seeded ${exercises.length} exercises: ${result.upsertedCount} inserted, ${result.modifiedCount} updated, ${removed.deletedCount} removed`
  );
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
