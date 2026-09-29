import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'],
    },
    passwordHash: { type: String, required: true, select: false },
    displayName: { type: String, required: true, trim: true, maxlength: 40 },
    // Bumped on password change → invalidates every JWT issued before it
    tokenVersion: { type: Number, default: 0, select: false },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.tokenVersion;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('User', userSchema);
