const express = require('express')
// const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const { getBoards, getBoard, addBoard, deleteBoard, updateBoard, movePieceOnBoard } = require('./board.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getBoards)
router.get('/:id', log, getBoard)
router.post('/',  requireAuth, log, addBoard)
router.delete('/:id', deleteBoard)
router.put('/:id/:userId',  log, updateBoard)
router.put('/:id',  log, movePieceOnBoard)

// router.post('/', requireAuth, addReview)

module.exports = router