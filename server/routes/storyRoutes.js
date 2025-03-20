const express = require('express');
const { createStory, getStories, viewStory, deleteStory, getStoryViews } = require('../controllers/storyController');

const router = express.Router();

router.post('/add', createStory);
router.get('/all', getStories);
router.get('/views/:storyId', getStoryViews)
router.put('/view', viewStory);
router.delete('/delete/:storyId', deleteStory);

module.exports = router;
