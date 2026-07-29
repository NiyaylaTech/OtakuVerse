import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { authenticateToken, AuthenticatedRequest, getJwtSecret } from '../middleware/auth';

const router = Router();

/**
 * Utility to escape regex special characters
 */
function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * Helper to generate JWT token for user
 */
function generateToken(user: { id: string; username: string; email: string }): string {
  const secret = getJwtSecret();
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    secret,
    { expiresIn: '7d' }
  );
}

/**
 * POST /api/auth/register
 * Creates a new user account
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, displayName, email, password, confirmPassword } = req.body;

    // 1. Check required fields
    if (!username || !displayName || !email || !password) {
      res.status(400).json({
        error: 'Please fill in all required fields.',
      });
      return;
    }

    // 2. Validate password match
    if (password !== confirmPassword) {
      res.status(400).json({
        error: 'Passwords do not match. Please verify your password.',
      });
      return;
    }

    // 3. Validate password strength
    if (password.length < 8) {
      res.status(400).json({
        error: 'Password must be at least 8 characters long.',
      });
      return;
    }

    // 4. Validate username format & length
    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      res.status(400).json({
        error: 'Username must be between 3 and 20 characters long.',
      });
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      res.status(400).json({
        error: 'Username can only contain letters, numbers, underscores, and hyphens.',
      });
      return;
    }

    // 5. Validate email format
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(trimmedEmail)) {
      res.status(400).json({
        error: 'Please enter a valid email address.',
      });
      return;
    }

    // 6. Check if username or email is already registered
    const existingUser = await User.findOne({
      $or: [
        { username: new RegExp(`^${escapeRegex(trimmedUsername)}$`, 'i') },
        { email: trimmedEmail },
      ],
    });

    if (existingUser) {
      if (existingUser.username.toLowerCase() === trimmedUsername.toLowerCase()) {
        res.status(400).json({
          error: 'This username is already taken. Please choose another one.',
        });
        return;
      }
      if (existingUser.email.toLowerCase() === trimmedEmail) {
        res.status(400).json({
          error: 'An account with this email address already exists. Please sign in instead.',
        });
        return;
      }
    }

    // 7. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 8. Create user in MongoDB
    const user = new User({
      username: trimmedUsername,
      displayName: displayName.trim(),
      email: trimmedEmail,
      passwordHash,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(trimmedUsername)}`,
      bio: 'OtakuVerse Anime Enthusiast',
      animeLevel: 1,
      experiencePoints: 100,
      favoriteGenres: [],
    });

    await user.save();

    // 9. Generate JWT
    const token = generateToken({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    });

    const userObj = user.toJSON();

    res.status(201).json({
      message: 'Account created successfully! Welcome to OtakuVerse.',
      token,
      user: userObj,
    });
  } catch (error: any) {
    console.error('Registration Error:', error.message || error);
    res.status(500).json({
      error: 'Failed to create account due to a server error. Please try again later.',
    });
  }
});

/**
 * POST /api/auth/login
 * Signs in an existing user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({
        error: 'Please enter both your username/email and password.',
      });
      return;
    }

    const trimmedIdentifier = identifier.trim();

    // Search user by username OR email (case-insensitive)
    const user = await User.findOne({
      $or: [
        { username: new RegExp(`^${escapeRegex(trimmedIdentifier)}$`, 'i') },
        { email: trimmedIdentifier.toLowerCase() },
      ],
    }).select('+passwordHash');

    if (!user) {
      res.status(401).json({
        error: 'Invalid username/email or password. Please try again.',
      });
      return;
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        error: 'Invalid username/email or password. Please try again.',
      });
      return;
    }

    // Generate JWT
    const token = generateToken({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    });

    const userObj = user.toJSON();

    res.json({
      message: 'Signed in successfully!',
      token,
      user: userObj,
    });
  } catch (error: any) {
    console.error('Login Error:', error.message || error);
    res.status(500).json({
      error: 'Failed to sign in due to a server error. Please try again later.',
    });
  }
});

/**
 * GET /api/auth/me
 * Gets currently authenticated user details
 */
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(401).json({
        error: 'User account no longer exists. Please sign up or sign in again.',
      });
      return;
    }

    res.json({
      user: user.toJSON(),
    });
  } catch (error: any) {
    console.error('Auth /me Error:', error.message || error);
    res.status(500).json({
      error: 'Failed to retrieve user profile.',
    });
  }
});

export default router;
