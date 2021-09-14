
const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
// const reviewService = require('../review/review.service')
const ObjectId = require('mongodb').ObjectId

module.exports = {
    query,
    getById,
    getByUsername,
    remove,
    update,
    add,
    clearCurrGame
}

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('USER')
        var users = await collection.find(criteria).toArray()
        // users = gUsers.map(user => {
        users = users.map(user => {
            delete user.password
            return user
        })
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        const collection = await dbService.getCollection('USER')
        // const user = await collection.findOne({ '_id': ObjectId(userId) })
        const user = await collection.findOne({ '_id': userId })
        // const user = gUsers.find(user => user._id === userId)
        delete user.password
        return user
    } catch (err) {
        logger.error(`while finding user ${userId}`, err)
        throw err
    }
}
async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection('USER')
        const user = await collection.findOne({ username })
        // const user = gUsers.find(user => user.username === username)
        return user
    } catch (err) {
        logger.error(`while finding user ${username}`, err)
        throw err
    }
}

async function remove(userId) {
    try {
        const collection = await dbService.getCollection('USER')
        await collection.deleteOne({ '_id': ObjectId(userId) })
        // var idx = gUsers.findindex(user => user._id === userId)
        // gUsers.splice(idx, 1)
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(user) {
    try {
        // peek only updatable fields!
        const userToSave = {
            // _id: ObjectId(user._id),
            game_played: user.game_played,
            avatar: user.avatar,
            followers: user.followers,
            last_online: Math.floor(new Date().getTime()/1000.0),
            win: user.win,
            lose: user.lose,
            draw: user.draw,
            curr_gameId: user.curr_gameId,
            game_history: user.game_history
        }
        const collection = await dbService.getCollection('USER')
        await collection.updateOne({ '_id': user._id }, { $set: userToSave })
        // var idx = gUsers.findIndex(gUser => user._id === gUser._id)
        // gUsers[idx] = {...gUsers[idx],...userToSave} 
        // return gUsers[idx];
        // const user = await collection.findOne({ '_id': ObjectId(user._id) })
        return userToSave;
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function add(user) {
    try {
        // peek only updatable fields!
        const userToAdd = {
            _id: _makeId(),
            username: user.username,
            password: user.password,
            name: user.firstName,
            lastName: user.lastName,
            email: user.email,
            game_played: 0,
            avatar: "",
            followers: [],
            last_online: 0,
            joined: Math.floor(new Date().getTime()/1000.0),
            status: "regular",
            win: 0,
            lose: 0,
            draw: 0,
            curr_gameId: [],
            game_history: []
    
        }
        const collection = await dbService.getCollection('USER')
        await collection.insertOne(userToAdd)
        // gUsers.push(userToAdd)
        return userToAdd
    } catch (err) {
        logger.error('cannot insert user', err)
        throw err
    }
}

async function clearCurrGame(userId, gameId) {
    try {
        const user = await getById(userId)
        var idx = user.curr_gameId.findIndex(currGameId => gameId === currGameId)
        if (idx === -1) throw new Error(`couldn't find game:${gameId} in ${user.username}`)
        user.curr_gameId.splice(idx, 1)
        const collection = await dbService.getCollection('USER')
        await collection.updateOne({ '_id': user._id }, { $set: user })
    } catch(err) {
        logger.error('cannot clear game from user', err)
    }
    
}


// function _buildCriteria(filterBy) {
//     const criteria = {}
//     if (filterBy.txt) {
//         const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
//         criteria.$or = [
//             {
//                 username: txtCriteria
//             },
//             {
//                 fullname: txtCriteria
//             }
//         ]
//     }
//     if (filterBy.minBalance) {
//         criteria.score = { $gte: filterBy.minBalance }
//     }
//     return criteria
// }

function _makeId(length = 6) {
    var txt = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return txt;
}



