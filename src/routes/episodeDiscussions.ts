import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { getEpisodesForAnimeAndSeason, fetchAniListMediaWithRelations } from '../services/episodes';
import { EpisodeDiscussion } from '../models/EpisodeDiscussion';
import { EpisodeComment } from '../models/EpisodeComment';

const router = Router();

/**
 * GET /api/anime/:anilistId/seasons
 * Return all available seasons for the anime series
 */
router.get('/anime/:anilistId/seasons', async (req: Request, res: Response) => {
  try {
    const anilistId = Number(req.params.anilistId);
    if (!anilistId || isNaN(anilistId)) {
      res.status(400).json({ success: false, error: 'Valid AniList ID parameter is required' });
      return;
    }

    const mediaInfo = await fetchAniListMediaWithRelations(anilistId);
    res.json({
      success: true,
      animeId: anilistId,
      title: mediaInfo.title,
      seasons: mediaInfo.seasons,
    });
  } catch (error: any) {
    console.error('Fetch Seasons Error:', error.message || error);
    res.status(500).json({ success: false, error: 'Failed to fetch anime seasons.' });
  }
});

/**
 * GET /api/anime/:anilistId/season/:seasonNumber/episodes
 * Return episodes for the selected season
 */
router.get('/anime/:anilistId/season/:seasonNumber/episodes', async (req: Request, res: Response) => {
  try {
    const anilistId = Number(req.params.anilistId);
    const seasonNumber = Number(req.params.seasonNumber) || 1;

    if (!anilistId || isNaN(anilistId)) {
      res.status(400).json({ success: false, error: 'Valid AniList ID parameter is required' });
      return;
    }

    const result = await getEpisodesForAnimeAndSeason(anilistId, seasonNumber);
    res.json({
      success: true,
      animeId: anilistId,
      ...result,
    });
  } catch (error: any) {
    console.error('Fetch Season Episodes Error:', error.message || error);
    res.status(500).json({ success: false, error: 'Failed to fetch season episodes.' });
  }
});

/**
 * Backward compatibility route
 * GET /api/anime/:anilistId/episodes
 */
router.get('/anime/:anilistId/episodes', async (req: Request, res: Response) => {
  try {
    const anilistId = Number(req.params.anilistId);
    if (!anilistId || isNaN(anilistId)) {
      res.status(400).json({ success: false, error: 'Valid AniList ID parameter is required' });
      return;
    }

    const result = await getEpisodesForAnimeAndSeason(anilistId, 1);
    res.json({
      success: true,
      animeId: anilistId,
      ...result,
    });
  } catch (error: any) {
    console.error('Fetch Episodes Error:', error.message || error);
    res.status(500).json({ success: false, error: 'Failed to fetch episode metadata.' });
  }
});

/**
 * GET /api/anime/:anilistId/season/:seasonNumber/episode/:episodeNumber
 * Return the episode metadata and discussion summary snapshot
 */
router.get('/anime/:anilistId/season/:seasonNumber/episode/:episodeNumber', async (req: Request, res: Response) => {
  try {
    const anilistId = Number(req.params.anilistId);
    const seasonNumber = Number(req.params.seasonNumber) || 1;
    const episodeNumber = Number(req.params.episodeNumber);

    if (!anilistId || isNaN(anilistId) || !episodeNumber || isNaN(episodeNumber)) {
      res.status(400).json({ error: 'Valid anilistId, seasonNumber, and episodeNumber required' });
      return;
    }

    // 1. Fetch Season Episodes to extract episode details
    const seasonData = await getEpisodesForAnimeAndSeason(anilistId, seasonNumber);
    const epData = seasonData.episodes.find((e) => e.episodeNumber === episodeNumber);

    // 2. Lookup existing discussion if available
    const discussion = await EpisodeDiscussion.findOne({ anilistId, seasonNumber, episodeNumber });

    res.json({
      anilistId,
      seasonNumber,
      episodeNumber,
      title: epData?.title || discussion?.episodeTitle || `Season ${seasonNumber}, Episode ${episodeNumber}`,
      description: epData?.description || discussion?.episodeDescription || 'An episode description is not currently available.',
      airedAt: epData?.airedAt || discussion?.episodeAirDate || null,
      runtime: epData?.runtime || discussion?.episodeRuntime || '24 min',
      isFiller: epData?.isFiller || false,
      isRecap: epData?.isRecap || false,
      discussion: discussion || null,
      seasons: seasonData.seasons,
      totalEpisodesInSeason: seasonData.episodes.length,
    });
  } catch (error: any) {
    console.error('Fetch Episode Metadata Error:', error.message || error);
    res.status(500).json({ error: 'Failed to fetch episode details.' });
  }
});

/**
 * GET /api/anime/:anilistId/season/:seasonNumber/episode/:episodeNumber/discussion
 * Return episode discussion
 */
router.get('/anime/:anilistId/season/:seasonNumber/episode/:episodeNumber/discussion', async (req: Request, res: Response) => {
  try {
    const anilistId = Number(req.params.anilistId);
    const seasonNumber = Number(req.params.seasonNumber) || 1;
    const episodeNumber = Number(req.params.episodeNumber);

    if (!anilistId || !episodeNumber) {
      res.status(400).json({ error: 'Valid anilistId and episodeNumber required' });
      return;
    }

    const discussion = await EpisodeDiscussion.findOneAndUpdate(
      { anilistId, seasonNumber, episodeNumber },
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    res.json({ discussion: discussion || null });
  } catch (error: any) {
    console.error('Fetch Episode Discussion Error:', error.message || error);
    res.status(500).json({ error: 'Failed to fetch episode discussion.' });
  }
});

/**
 * POST /api/anime/:anilistId/season/:seasonNumber/episode/:episodeNumber/discussion
 * Find or create the single episode discussion using atomic findOneAndUpdate with upsert
 */
router.post('/anime/:anilistId/season/:seasonNumber/episode/:episodeNumber/discussion', async (req: Request, res: Response) => {
  try {
    const anilistId = Number(req.params.anilistId);
    const seasonNumber = Number(req.params.seasonNumber) || 1;
    const episodeNumber = Number(req.params.episodeNumber);

    const {
      malId,
      episodeInSeason,
      episodeTitle,
      episodeDescription,
      episodeAirDate,
      episodeRuntime,
      episodeMetadataSource,
      createdBy,
    } = req.body;

    if (!anilistId || !episodeNumber) {
      res.status(400).json({ error: 'Valid anilistId and episodeNumber required' });
      return;
    }

    const finalTitle = episodeTitle && episodeTitle.trim() ? episodeTitle.trim() : `Season ${seasonNumber}, Episode ${episodeNumber}`;
    const finalDesc = episodeDescription && episodeDescription.trim() ? episodeDescription.trim() : 'An episode description is not currently available.';

    const discussion = await EpisodeDiscussion.findOneAndUpdate(
      { anilistId, seasonNumber, episodeNumber },
      {
        $setOnInsert: {
          anilistId,
          seasonNumber,
          episodeNumber,
          episodeInSeason: episodeInSeason || episodeNumber,
          malId: malId || null,
          episodeTitle: finalTitle,
          episodeDescription: finalDesc,
          episodeAirDate: episodeAirDate || null,
          episodeRuntime: episodeRuntime || null,
          episodeMetadataSource: episodeMetadataSource || 'fallback',
          createdBy: createdBy || 'OtakuVerse Member',
          commentCount: 0,
          participantUserIds: [],
          participantCount: 0,
          viewCount: 0,
          lastActivityAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(
      "Saved discussion to DB:",
      EpisodeDiscussion.db.name,
      "Collection:",
      EpisodeDiscussion.collection.name
    );

    res.status(200).json({ discussion });
  } catch (error: any) {
    console.error('Find/Create Discussion Error:', error.message || error);
    res.status(500).json({ error: 'Failed to process episode discussion.' });
  }
});

/**
 * GET /api/episode-discussions/:discussionId/comments
 */
router.get('/episode-discussions/:discussionId/comments', async (req: Request, res: Response) => {
  try {
    const { discussionId } = req.params;
    if (!discussionId || !mongoose.Types.ObjectId.isValid(discussionId)) {
      res.json({ comments: [] });
      return;
    }

    const comments = await EpisodeComment.find({
      episodeDiscussionId: new mongoose.Types.ObjectId(discussionId),
    })
      .sort({ createdAt: 1 })
      .limit(500);

    res.json({ comments });
  } catch (error: any) {
    console.error('Fetch Episode Comments Error:', error.message || error);
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
});

/**
 * POST /api/episode-discussions/:discussionId/comments
 */
router.post('/episode-discussions/:discussionId/comments', async (req: Request, res: Response) => {
  try {
    const { discussionId } = req.params;
    const { userId, author, avatar, animeLevel, parentCommentId, replyToUserId, replyToAuthor, body, isSpoiler } = req.body;

    if (!body || !body.trim()) {
      res.status(400).json({ error: 'Comment body cannot be empty' });
      return;
    }

    const comment = new EpisodeComment({
      episodeDiscussionId: new mongoose.Types.ObjectId(discussionId),
      userId: userId || null,
      author: author || 'OtakuVerse Fan',
      avatar: avatar || '',
      animeLevel: animeLevel || 1,
      parentCommentId: parentCommentId && mongoose.Types.ObjectId.isValid(parentCommentId) ? new mongoose.Types.ObjectId(parentCommentId) : null,
      replyToUserId: replyToUserId || null,
      replyToAuthor: replyToAuthor || null,
      body: body.trim(),
      isSpoiler: Boolean(isSpoiler),
    });

    await comment.save();

    // Update parent discussion stats
    const participantIdentifier = userId || author || 'OtakuVerse Fan';
    const discussion = await EpisodeDiscussion.findById(discussionId);

    if (discussion) {
      discussion.commentCount += 1;
      discussion.lastActivityAt = new Date();

      if (!discussion.participantUserIds.includes(participantIdentifier)) {
        discussion.participantUserIds.push(participantIdentifier);
      }
      discussion.participantCount = discussion.participantUserIds.length;

      await discussion.save();
    }

    res.status(201).json({ comment });
  } catch (error: any) {
    console.error('Post Episode Comment Error:', error.message || error);
    res.status(500).json({ error: 'Failed to post comment.' });
  }
});

/**
 * PATCH /api/episode-comments/:commentId
 * Edit comment or toggle parameters
 */
router.patch('/episode-comments/:commentId', async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { body, isSpoiler } = req.body;

    const comment = await EpisodeComment.findById(commentId);
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (body !== undefined) {
      comment.body = body.trim();
      comment.isEdited = true;
    }
    if (isSpoiler !== undefined) {
      comment.isSpoiler = Boolean(isSpoiler);
    }

    await comment.save();
    res.json({ comment });
  } catch (error: any) {
    console.error('Patch Comment Error:', error.message || error);
    res.status(500).json({ error: 'Failed to update comment.' });
  }
});

/**
 * DELETE /api/episode-comments/:commentId
 */
router.delete('/episode-comments/:commentId', async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const comment = await EpisodeComment.findById(commentId);

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    const discussionId = comment.episodeDiscussionId;
    await EpisodeComment.findByIdAndDelete(commentId);

    if (discussionId) {
      const discussion = await EpisodeDiscussion.findById(discussionId);
      if (discussion) {
        discussion.commentCount = Math.max(0, discussion.commentCount - 1);
        await discussion.save();
      }
    }

    res.json({ message: 'Comment removed successfully' });
  } catch (error: any) {
    console.error('Delete Comment Error:', error.message || error);
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
});

/**
 * POST /api/episode-comments/:commentId/like
 */
router.post('/episode-comments/:commentId/like', async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;
    const userKey = userId || 'anonymous';

    const comment = await EpisodeComment.findById(commentId);
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (!comment.likedBy.includes(userKey)) {
      comment.likedBy.push(userKey);
      comment.likeCount += 1;
      await comment.save();
    }

    res.json({ comment });
  } catch (error: any) {
    console.error('Like Comment Error:', error.message || error);
    res.status(500).json({ error: 'Failed to like comment.' });
  }
});

/**
 * DELETE /api/episode-comments/:commentId/like
 */
router.delete('/episode-comments/:commentId/like', async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;
    const userKey = userId || 'anonymous';

    const comment = await EpisodeComment.findById(commentId);
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (comment.likedBy.includes(userKey)) {
      comment.likedBy = comment.likedBy.filter((id) => id !== userKey);
      comment.likeCount = Math.max(0, comment.likeCount - 1);
      await comment.save();
    }

    res.json({ comment });
  } catch (error: any) {
    console.error('Unlike Comment Error:', error.message || error);
    res.status(500).json({ error: 'Failed to unlike comment.' });
  }
});

/**
 * POST /api/episode-comments/:commentId/report
 */
router.post('/episode-comments/:commentId/report', async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { userId, reason } = req.body;
    const userKey = userId || 'anonymous';

    const comment = await EpisodeComment.findById(commentId);
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (!comment.reportedBy.includes(userKey)) {
      comment.reportedBy.push(userKey);
      comment.reportCount += 1;
      await comment.save();
    }

    res.json({ message: 'Comment reported successfully', comment });
  } catch (error: any) {
    console.error('Report Comment Error:', error.message || error);
    res.status(500).json({ error: 'Failed to report comment.' });
  }
});

export default router;
