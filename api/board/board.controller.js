const logger = require('../../services/logger.service')
// const userService = require('../user/user.service')
// const socketService = require('../../services/socket.service')
// const reviewService = require('./review.service')
const boardService = require('./board.service')
const userService = require('../user/user.service')

async function getBoards(req, res) {
    try {
        const boards = await boardService.query(req.query)
        res.send(boards)
    } catch (err) {
        logger.error('Cannot get boards', err)
        res.status(500).send({ err: 'Failed to get boards' })
    }
}

async function getBoard(req, res) {
    try {
        const board = await boardService.getById(req.params.id)
        res.send(board)
    } catch (err) {
        logger.error(`Connot get board from service, id: ${req.id}`)
        res.status(500).send({ err: 'Failed to get board' })
    }
}

async function addBoard(req, res) {
    try {
        const user = req.body
        const savedBoard = await boardService.add(user)
        res.send(savedBoard)
    } catch (err) {
        logger.error('Failed to creat new board', err)
        res.status(500).send({ err: 'Failed to creat new board' })
    }
}

async function deleteBoard(req, res) {
    try {
        await boardService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete board', err)
        res.status(500).send({ err: 'Failed to delete board' })
    }
}

async function updateBoard(req, res) {
    try {
        const { boardId, playerId } = req.body
        const game = await boardService.getById(boardId)
        if (game.blackPlayer.user)
            console.log('No possible to join - Game Full ');
        else {
            const user = await userService.getById(playerId)
            game.blackPlayer.user = { _id: user._id, username: user.username }
            user.curr_gameId = game._id
            console.log(game)
            await userService.update(user)
            let updatedGame = await boardService.update(game) 
            res.send(updatedGame)
        }
        // const savedBoard = await boardService.update(board)
        // socketService.broadcast({type: 'user-updated', data: review, to:savedUser._id})
    } catch (err) {
        logger.error('Failed to update board', err)
        res.status(500).send({ err: 'Failed to update board' })
    }
}

async function movePieceOnBoard(req, res) {
    try {
        const { gameId, fromCoord, toCoord, frontBoard } = req.body
        // console.log(gameId, fromCoord, toCoord, frontBoard);
        const savedBoard = await boardService.movePiece(gameId, fromCoord, toCoord, frontBoard)
        res.send(savedBoard)
    } catch (err) {
        logger.error('Failed to move piece on board', err)
        res.status(500).send({ err: 'Failed to move piece on board' })
    }
}

module.exports = {
    getBoards,
    getBoard,
    addBoard,
    deleteBoard,
    updateBoard,
    movePieceOnBoard
}