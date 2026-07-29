import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { getEpisodesForAnime } from '../services/episodes';
import { EpisodeDiscussion } from '../models/EpisodeDiscussion';
import { EpisodeComment } from '../models/EpisodeComment';

const router = Router();

/**
 * GET /api/anime/:anilistId/episodes
 * Returns normalized episode metadata with season number, episode number, and title
 */
router.get('/anime/:anilistId/episodes', async (req: Request, res: Response) => {
  try {
    const anilistId = Number(req.params.anilistId);
    if (!anilistId || isNaN(anilistId)) {
      res.status(400).json({ error: 'Valid AniList ID parameter is required' });
      return;
    }

    const result = await getEpisodesForAnime(anilistId);
    res.json(result);
  } catch (error: any) {
    console.error('Fetch Episodes Error:', error.message || error);
    res.status(500).json({ error: 'Failed to fetch episode metadata.' });
  }
});

/**
 * GET /api/anime/:anilistId/season/:seasonNumber/episode/:episodeNumber/discussion
 * Fetch single matching episode discussion
 */
router.get(
  '/anime/:anilistId/season/:seasonNumber/episode/:episodeNumber/discussion',
  async (req: Request, res: Response) => {
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
  }
);

/**
 * POST /api/anime/:anilistId/season/:seasonNumber/episode/:episodeNumber/discussion
 * Find or create single matching discussion thread
 */
router.post(
  '/anime/:anilistId/season/:seasonNumber/episode/:episodeNumber/discussion',
  async (req: Request, res: Response) => {
    try {
      const anilistId = Number(req.params.anilistId);
      const seasonNumber = Number(req.params.seasonNumber) || 1;
      const episodeNumber = Number(req.params.episodeNumber);

      const { malId, episodeInSeason, episodeTitle, episodeTitleSource, createdBy } = req.body;

      if (!anilistId || !episodeNumber) {
        res.status(400).json({ error: 'Valid anilistId and episodeNumber required' });
        return;
      }

      // Single find-or-create using atomic findOneAndUpdate with upsert
      const discussion = await EpisodeDiscussion.findOneAndUpdate(
        { anilistId, seasonNumber, episodeNumber },
        {
          $setOnInsert: {
            anilistId,
            seasonNumber,
            episodeNumber,
            episodeInSeason: episodeInSeason || episodeNumber,
            malId: malId || null,
            episodeTitle: episodeTitle || 'Title Unavailable',
            episodeTitleSource: episodeTitleSource || 'fallback',
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

      // Log saved discussion database and collection name as required
      console.log(
        "Saved discussion to:",
        EpisodeDiscussion.db.name,
        EpisodeDiscussion.collection.name
      );

      res.status(200).json({ discussion });
    } catch (error: any) {
      console.error('Find/Create Discussion Error:', error.message || error);
      res.status(500).json({ error: 'Failed to process episode discussion.' });
    }
  }
);

/**
 * GET /api/episode-discussions/:discussionId/comments
 * Retrieve all comments for an episode discussion
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
      .limit(200);

    res.json({ comments });
  } catch (error: any) {
    console.error('Fetch Episode Comments Error:', error.message || error);
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
});

/**
 * POST /api/episode-discussions/:discussionId/comments
 * Post a comment or reply to an episode discussion thread
 */
router.post('/episode-discussions/:discussionId/comments', async (req: Request, res: Response) => {
  try {
    const { discussionId } = req.params;
    const { userId, author, avatar, parentCommentId, replyToUserId, replyToAuthor, body, isSpoiler } = req.body;

    if (!body || !body.trim()) {
      res.status(400).json({ error: 'Comment body cannot be empty' });
      return;
    }

    const comment = new EpisodeComment({
      episodeDiscussionId: new mongoose.Types.ObjectId(discussionId),
      userId: userId || null,
      author: author || 'OtakuVerse Fan',
      avatar: avatar || '',
      parentCommentId:
        parentCommentId && mongoose.Types.ObjectId.isValid(parentCommentId)
          ? new mongoose.Types.ObjectId(parentCommentId)
          : null,
      replyToUserId: replyToUserId || null,
      replyToAuthor: replyToAuthor || null,
      body: body.trim(),
      isSpoiler: Boolean(isSpoiler),
    });

    await comment.save();

    // Update parent EpisodeDiscussion thread stats
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
 * Edit a comment or toggle like
 */
router.patch('/episode-comments/:commentId', async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { body, isSpoiler, action, userId } = req.body;

    const comment = await EpisodeComment.findById(commentId);
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (action === 'like') {
      const userKey = userId || 'anonymous';
      const hasLiked = comment.likedBy.includes(userKey);

      if (hasLiked) {
        comment.likedBy = comment.likedBy.filter((id) => id !== userKey);
        comment.likeCount = Math.max(0, comment.likeCount - 1);
      } else {
        comment.likedBy.push(userKey);
        comment.likeCount += 1;
      }
    } else {
      if (body !== undefined) {
        comment.body = body.trim();
        comment.isEdited = true;
      }
      if (isSpoiler !== undefined) {
        comment.isSpoiler = Boolean(isSpoiler);
      }
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
 * Delete comment
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

    // Update discussion count
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

export default router;
