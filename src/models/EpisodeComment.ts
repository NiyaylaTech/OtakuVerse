import mongoose, { Schema, Document } from 'mongoose';

export interface IEpisodeComment extends Document {
  episodeDiscussionId: mongoose.Types.ObjectId | string;
  userId?: string;
  author: string;
  avatar?: string;
  parentCommentId?: Schema.Types.ObjectId | null;
  replyToUserId?: string | null;
  replyToAuthor?: string | null;
  body: string;
  isSpoiler: boolean;
  likeCount: number;
  likedBy: string[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EpisodeCommentSchema = new Schema<IEpisodeComment>(
  {
    episodeDiscussionId: {
      type: Schema.Types.ObjectId,
      ref: 'EpisodeDiscussion',
      required: true,
      index: true,
    },
    userId: {
      type: String,
      default: null,
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      default: 'OtakuVerse Fan',
    },
    avatar: {
      type: String,
      default: '',
    },
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: 'EpisodeComment',
      default: null,
    },
    replyToUserId: {
      type: String,
      default: null,
    },
    replyToAuthor: {
      type: String,
      default: null,
    },
    body: {
      type: String,
      required: [true, 'Comment message body cannot be empty'],
      trim: true,
    },
    isSpoiler: {
      type: Boolean,
      default: false,
    },
    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    likedBy: {
      type: [String],
      default: [],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
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

export const EpisodeComment = mongoose.model<IEpisodeComment>(
  'EpisodeComment',
  EpisodeCommentSchema,
  'episode_comments'
);
