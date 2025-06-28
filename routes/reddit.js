// Reddit API routes
const express = require('express');
const router = express.Router();

// Import Reddit controllers
const { discoverRelevantSubreddits, searchRedditDiscussions, getRedditTrending, generateRedditSearchQueries } = require('../controllers/reddit');

// Reddit API routes
router.post('/discoverSubreddits', discoverRelevantSubreddits);
router.post('/searchReddit', searchRedditDiscussions);
router.post('/redditTrending', getRedditTrending);
router.post('/generateRedditSearchQueries', generateRedditSearchQueries);

module.exports = router;