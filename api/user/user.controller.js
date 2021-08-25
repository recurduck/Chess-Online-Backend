const userService = require('./user.service')
// const socketService = require('../../services/socket.service')
const logger = require('../../services/logger.service')

async function getUsers(req, res) {
    try {
        const filterBy = {
            txt: req.query?.txt || '',
        }
        const users = await userService.query(filterBy)
        res.send(users)
    } catch (err) {
        logger.error('Failed to get users', err)
        res.status(500).send({ err: 'Failed to get users' })
    }
}

async function getUser(req, res) {
    try {
        const user = await userService.getById(req.params.id)
        req.session.user = user
        console.log(req.session);
        res.send(user)
    } catch (err) {
        logger.error('Failed to get user', err)
        res.status(500).send({ err: 'Failed to get user' })
    }
}


async function deleteUser(req, res) {
    try {
        await userService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete user', err)
        res.status(500).send({ err: 'Failed to delete user' })
    }
}

async function updateUser(req, res) {
    try {
        const user = req.body
        const savedUser = await userService.update(user)
        res.send(savedUser)
        socketService.broadcast({ type: 'user-updated', data: review, to: savedUser._id })
    } catch (err) {
        logger.error('Failed to update user', err)
        res.status(500).send({ err: 'Failed to update user' })
    }
}

async function validateUser(req, res) {
    try {
        const { username, password } = req.body
        const user = await userService.getByUsername(username)
        if(user.password === password) {
            delete user.password
            user.last_online = Math.floor(new Date().getTime()/1000.0)
            res.send(user)
        }
        return null
    } catch (err) {
        logger.error('Failed to validate User', err)
        res.status(500).send({ err: 'Failed to update user' })
    }
}

module.exports = {
    getUser,
    getUsers,
    deleteUser,
    updateUser,
    validateUser
}