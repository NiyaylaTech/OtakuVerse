import { Router, Request, Response } from 'express';
import { Discussion } from '../models/Discussion';

const router = Router();

/**
 * GET /api/discussions
 * Fetch list of discussion threads
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const mediaId = req.query.mediaId ? String(req.query.mediaId) : undefined;
    const filter = mediaId ? { mediaId } : {};
    const discussions = await Discussion.find(filter as Record<string, any>).sort({ createdAt: -1 }).limit(50);
    res.json({ discussions });
  } catch (error: any) {
    console.error('Fetch Discussions Error:', error.message || error);
    res.status(500).json({ error: 'Failed to fetch discussions.' });
  }
});

/**
 * POST /api/discussions
 * Create a new discussion thread using Discussion.create(...) or new Discussion(...).save()
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { mediaId, mediaTitle, topic, body, author, userId, category } = req.body;

    if (!topic || !body) {
      res.status(400).json({ error: 'Topic and discussion content are required.' });
      return;
    }

    // Save discussion using new Discussion(...).save()
    const discussion = new Discussion({
      mediaId,
      mediaTitle,
      topic,
      body,
      author: author || 'OtakuVerse Member',
      userId,
      category,
      repliesCount: 0,
    });

    await discussion.save();

    // Log the saved discussion's database and collection
    console.log(
      "Saved discussion to:",
      Discussion.db.name,
      Discussion.collection.name
    );

    res.status(201).json({
      message: 'Discussion created successfully',
      discussion,
    });
  } catch (error: any) {
    console.error('Create Discussion Error:', error.message || error);
    res.status(500).json({ error: 'Failed to create discussion.' });
  }
});

export default router;
