import mongoose, { Schema, Document } from 'mongoose';

export interface IDiscussion extends Document {
  mediaId?: string | number;
  mediaTitle?: string;
  topic: string;
  body: string;
  author: string;
  userId?: string;
  repliesCount: number;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DiscussionSchema = new Schema<IDiscussion>(
  {
    mediaId: {
      type: Schema.Types.Mixed,
      required: false,
    },
    mediaTitle: {
      type: String,
      trim: true,
      default: '',
    },
    topic: {
      type: String,
      required: [true, 'Discussion topic is required'],
      trim: true,
      minlength: [3, 'Topic must be at least 3 characters'],
      maxlength: [200, 'Topic cannot exceed 200 characters'],
    },
    body: {
      type: String,
      required: [true, 'Discussion content body is required'],
      trim: true,
      minlength: [5, 'Discussion body must be at least 5 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      default: 'OtakuVerse Member',
    },
    userId: {
      type: String,
      required: false,
    },
    repliesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      default: 'General Anime',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Explicitly bind Discussion model to 'discussions' collection
export const Discussion = mongoose.model<IDiscussion>('Discussion', DiscussionSchema, 'discussions');
