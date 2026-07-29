import mongoose, { Schema, Document } from 'mongoose';

export interface IAnimeSeasonMapping extends Document {
  anilistId: number;
  malId?: number;
  franchiseKey?: string;
  seasonNumber: number;
  seasonTitle?: string;
  episodeNumberOffset: number;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnimeSeasonMappingSchema = new Schema<IAnimeSeasonMapping>(
  {
    anilistId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    malId: {
      type: Number,
      required: false,
    },
    franchiseKey: {
      type: String,
      default: '',
    },
    seasonNumber: {
      type: Number,
      default: 1,
    },
    seasonTitle: {
      type: String,
      default: '',
    },
    episodeNumberOffset: {
      type: Number,
      default: 0,
    },
    verified: {
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

export const AnimeSeasonMapping = mongoose.model<IAnimeSeasonMapping>(
  'AnimeSeasonMapping',
  AnimeSeasonMappingSchema,
  'anime_season_mappings'
);
