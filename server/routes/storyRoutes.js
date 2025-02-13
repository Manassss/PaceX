const express = require('express');
const { createStory, getStories, viewStory, deleteStory } = require('../controllers/storyController');

const router = express.Router();

router.post('/add', createStory);
router.get('/all', getStories);
router.put('/view', viewStory);
router.delete('/delete', deleteStory);

module.exports = router;
