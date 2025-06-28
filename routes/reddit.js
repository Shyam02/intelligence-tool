// Reddit API routes
const express = require('express');
const router = express.Router();

// Import Reddit controllers
const { discoverRelevantSubreddits, searchRedditDiscussions, getRedditTrending, generateRedditSearchQueries } = require('../controllers/reddit');

// Reddit API routes
router.post('/discover-subreddits', discoverRelevantSubreddits);
router.post('/search-reddit', searchRedditDiscussions);
router.post('/reddit-trending', getRedditTrending);
router.post('/generateRedditSearchQueries', generateRedditSearchQueries);

module.exports = router;