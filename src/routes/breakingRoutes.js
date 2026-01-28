// src/routes/breakingNewsRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
    createBreakingNews, getLiveBreaking, getAllBreakingNews,
    getBreakingNewsById, updateBreakingNews, triggerNotification, deleteBreaking
} = require('../controllers/breakingNewsController');


router.get('/live', getLiveBreaking);

router.use(authMiddleware);

router.post('/', createBreakingNews);
router.get('/all', getAllBreakingNews);
router.get('/:id', getBreakingNewsById);
router.put('/:id', updateBreakingNews);
router.delete('/:id', deleteBreaking);


router.post('/:id/notify', triggerNotification);

module.exports = router;