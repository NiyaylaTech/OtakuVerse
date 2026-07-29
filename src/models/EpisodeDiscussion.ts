import mongoose, { Schema, Document } from 'mongoose';

export interface IEpisodeDiscussion extends Document {
  anilistId: number;
  malId?: number | null;
  seasonNumber: number;
  episodeNumber: number;
  episodeInSeason: number;
  episodeTitle: string;
  episodeDescription: string;
  episodeAirDate?: string | null;
  episodeRuntime?: string | number | null;
  episodeMetadataSource: 'jikan' | 'fallback';
  episodeMetadataVerified: boolean;
  createdBy: string;
  commentCount: number;
  participantUserIds: string[];
  participantCount: number;
  viewCount: number;
  lastActivityAt: Date;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EpisodeDiscussionSchema = new Schema<IEpisodeDiscussion>(
  {
    anilistId: {
      type: Number,
      required: true,
      index: true,
    },
    malId: {
      type: Number,
      default: null,
    },
    seasonNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    episodeNumber: {
      type: Number,
      required: true,
    },
    episodeInSeason: {
      type: Number,
      required: true,
      default: 1,
    },
    episodeTitle: {
      type: String,
      default: 'Title Unavailable',
      trim: true,
    },
    episodeDescription: {
      type: String,
      default: 'An episode description is not currently available.',
      trim: true,
    },
    episodeAirDate: {
      type: String,
      default: null,
    },
    episodeRuntime: {
      type: Schema.Types.Mixed,
      default: null,
    },
    episodeMetadataSource: {
      type: String,
      enum: ['jikan', 'fallback'],
      default: 'fallback',
    },
    episodeMetadataVerified: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: String,
      default: 'OtakuVerse Member',
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    participantUserIds: {
      type: [String],
      default: [],
    },
    participantCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    isLocked: {
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

// Unique index to guarantee one discussion per anime, season, and episode
EpisodeDiscussionSchema.index(
  { anilistId: 1, seasonNumber: 1, episodeNumber: 1 },
  { unique: true }
);

export const EpisodeDiscussion = mongoose.model<IEpisodeDiscussion>(
  'EpisodeDiscussion',
  EpisodeDiscussionSchema,
  'episode_discussions'
);
