// const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
const userService = require('../user/user.service')

const KIT = {
    KING_WHITE: '♔',
    QUEEN_WHITE: '♕',
    ROOK_WHITE: '♖',
    BISHOP_WHITE: '♗',
    KNIGHT_WHITE: '♘',
    PAWN_WHITE: '♙',
    KING_BLACK: '♚',
    QUEEN_BLACK: '♛',
    ROOK_BLACK: '♜',
    BISHOP_BLACK: '♝',
    KNIGHT_BLACK: '♞',
    PAWN_BLACK: '♟'
}
var gBoards = []
var exBoard = {
    "_id": "5e28393890dd7201a06d4e44",
    "gameBoard": [],
    "countGame": 1,
    "whiteTurn": true,
    "selectedCell": null,
    "whitePlayer": {
        "user": null, //{"_id": "5e26e0b718a0891d4c995527","username": "Magnus Carlsen"}
        "time": 180000,
        "kingPos": { "i": 7, "j": 4 },
        "kingMoved": false,
        "closeRookMoved": false,
        "farRookMoved": false,
        "lastMove": {
            "fromCoord": null,
            "toCoord": null,
            "piece": ""
        }
    },
    "blackPlayer": {
        "user": null, //{"_id": "5e26e0b718a0891d4c995537", "username": "Fabiano Caruana"}
        "time": 180000,
        "kingPos": { "i": 0, "j": 4 },
        "kingMoved": false,
        "closeRookMoved": false,
        "farRookMoved": false,
        "lastMove": {
            "fromCoord": null,
            "toCoord": null,
            "piece": ""
        }
    }
}
_createBoards();
function _createBoards() {
    boards = []
    for (let i = 0; i < 1; i++) {
        var player1 = { "_id": "007", "username": "admin" }
        var player2 = { "_id": "008", "username": "admin2" }
        boards.push(_createBoard(player1, player2))
    }
    gBoards = boards;
}
function _createBoard(player1, player2 = null) {
    let board = JSON.parse(JSON.stringify(exBoard))
    board._id = _makeId(5)
    board.gameBoard = _buildBoard();
    board.whitePlayer.user = {
        _id: player1._id,
        username: player1.username
    }
    if (player2) {
        board.blackPlayer.user = {
            _id: player2._id,
            username: player2.username
        }
    }
    return board
}
function _buildBoard() {
    let board = [];
    for (var i = 0; i < 8; i++) {
        board[i] = [];
        for (var j = 0; j < 8; j++) {
            let piece = ''
            let isWhite = undefined
            if (i === 1) {
                piece = KIT.PAWN_BLACK;
                isWhite = false
            } else if (i === 0) isWhite = false
            else if (i === 6) {
                piece = KIT.PAWN_WHITE;
                isWhite = true
            } else if (i === 7) isWhite = true
            board[i][j] = {
                piece,
                isMarked: false,
                isSelected: false,
                isWhite,
            };
        }
    }
    board[0][0].piece = board[0][7].piece = KIT.ROOK_BLACK;
    board[0][1].piece = board[0][6].piece = KIT.KNIGHT_BLACK;
    board[0][2].piece = board[0][5].piece = KIT.BISHOP_BLACK;
    board[0][3].piece = KIT.QUEEN_BLACK;
    board[0][4].piece = KIT.KING_BLACK;
    board[7][0].piece = board[7][7].piece = KIT.ROOK_WHITE;
    board[7][1].piece = board[7][6].piece = KIT.KNIGHT_WHITE;
    board[7][2].piece = board[7][5].piece = KIT.BISHOP_WHITE;
    board[7][3].piece = KIT.QUEEN_WHITE;
    board[7][4].piece = KIT.KING_WHITE;
    return board;
}
function _makeId(length = 6) {
    var txt = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return txt;
}


module.exports = {
    query,
    getById,
    remove,
    update,
    add,
    movePiece
}

async function query(filterBy = {}) {
    // const criteria = _buildCriteria(filterBy)
    try {
        // const collection = await dbService.getCollection('board')
        // var boards = await collection.find(criteria).toArray()
        var boards = await gBoards
        return boards
    } catch (err) {
        logger.error('cannot find boards', err)
        throw err
    }
}

async function getById(id) {
    try {
        var boards = await gBoards
        return boards.find(board => board._id === id)
    } catch (err) {
        logger.error(`connot find board, id: ${id} NOT FOUND`, err)
        throw err
    }
}

async function add(user) {
    try {
        var boards = await gBoards
        var newBoard = _createBoard(user)
        boards.unshift(newBoard)
        gBoards = boards
        return newBoard
    } catch (err) {
        logger.error('cannot add new Board', err)
        throw err
    }
}

async function remove(id) {
    try {
        // const collection = await dbService.getCollection('user')
        // await collection.deleteOne({ '_id': ObjectId(userId) })
        var idx = gBoards.findIndex(board => board._id === id)
        if (idx === -1) return
        gBoards.splice(idx, 1)
    } catch (err) {
        logger.error(`cannot remove board ${id}`, err)
        throw err
    }
}

async function update(board) {
    try {
        // const boardToSave = {
        //    _id: ObjectId(user._id),
        //     username: user.username,
        //     fullname: user.fullname,
        //     score: user.score
        // }
        // const collection = await dbService.getCollection('user')
        // await collection.updateOne({ '_id': userToSave._id }, { $set: userToSave })
        var idx = gBoards.findIndex(game => game._id === board._id)
        gBoards[idx] = board
        return board;
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function movePiece(gameId, fromCoord, toCoord, frontBoard) {
    let game = await getById(gameId)
    if (_validateBoard(frontBoard, game.gameBoard)) {
        let res = await _movePiece(gameId, fromCoord, toCoord)
        return res
    }
    return game
}

async function _movePiece(gameId, fromCoord, toCoord) {
    var game = await getById(gameId)

    var board = game.gameBoard
    if (_isEnPassant(toCoord, fromCoord, game.whiteTurn, board[fromCoord.i][fromCoord.j].piece === KIT.PAWN_WHITE, board, game)) {
        board[fromCoord.i][toCoord.j].piece = '';
        board[fromCoord.i][toCoord.j].isWhite = undefined;
    }
    let piece = board[fromCoord.i][fromCoord.j].piece;
    board[fromCoord.i][fromCoord.j].piece = '';
    board[fromCoord.i][fromCoord.j].isWhite = undefined;
    board[toCoord.i][toCoord.j].piece = _isPawnAQueen(toCoord, piece);
    board[toCoord.i][toCoord.j].isWhite = game.whiteTurn;
    _updateKingsMoved(piece, toCoord, game);
    _updateRooksMoved(piece, fromCoord, game);
    game.whiteTurn ? game.whitePlayer.lastMove = { fromCoord, toCoord } : game.blackPlayer.lastMove = { fromCoord, toCoord };
    game.whiteTurn = !game.whiteTurn;
    _cleanBoard(board)
    await update(game)
    if (_isCheckMate(!game.whiteTurn ? game.blackPlayer.kingPos : game.whitePlayer.kingPos, game)) {
        await _checkMate(game)
    }
    return game
}

async function _validateBoard(frontBoard, backendBoard) {
    for (let i = 0; i < backendBoard.length; i++) {
        for (let j = 0; j < backendBoard.length; j++) {
            let front = frontBoard[i][j]
            let backend = backendBoard[i][j]
            if (front.piece !== backend.piece || front.isWhite !== backend.isWhite) return false
        }
    }
    logger.info('board is validated');
    return true
}

async function _checkMate(game) {
    game.countGame++
    // if (window.confirm(`CheckMate! ${(game.whiteTurn) ? 'Black' : 'White'} Win!`)) {
    logger.debug(`CheckMate! ${(game.whiteTurn) ? 'Black' : 'White'} Win!`);
    let winner = await userService.getById(game.whiteTurn?game.blackPlayer.user._id:game.whitePlayer.user._id)
    let loser = await userService.getById(game.whiteTurn?game.whitePlayer.user._id:game.blackPlayer.user._id)
    winner.win++
    winner.game_played++
    loser.lose++
    loser.game_played++
    
    const historyNote = {gameNum: 0,win: winner.username, lose: loser.username, time: Math.floor(new Date().getTime()/1000.0)}
    winner.game_history.unshift({...historyNote, gameNum: winner.game_played})
    loser.game_history.unshift({...historyNote, gameNum: loser.game_played})
    
    await userService.update(winner)
    await userService.update(loser)
    game.gameBoard = _buildBoard()
    _cleanBoard(game.gameBoard)
    let tempuser = {...game.blackPlayer.user}
    game.blackPlayer.user ={...game.whitePlayer.user}
    game.whitePlayer.user = {...tempuser}
}

function _nextStepModal(fromCoord, toCoord, game) {
    //return false if in the next step the king is still checked
    let nextStepBoard = JSON.parse(JSON.stringify(game.gameBoard))
    let piece = nextStepBoard[fromCoord.i][fromCoord.j].piece;
    let newWhiteKingPos = game.whitePlayer.kingPos;
    let newBlackKingPos = game.blackPlayer.kingPos;
    // update the NEXT STEP MODEL
    nextStepBoard[fromCoord.i][fromCoord.j].piece = '';
    nextStepBoard[toCoord.i][toCoord.j].piece = _isPawnAQueen(toCoord, piece);
    nextStepBoard[toCoord.i][toCoord.j].isWhite = nextStepBoard[fromCoord.i][fromCoord.j].isWhite;
    nextStepBoard[fromCoord.i][fromCoord.j].isWhite = undefined
    if (piece === KIT.KING_WHITE) newWhiteKingPos = { i: toCoord.i, j: toCoord.j }
    else if (piece === KIT.KING_BLACK) newBlackKingPos = { i: toCoord.i, j: toCoord.j }
    return _isCheck(!game.whiteTurn ? newBlackKingPos : newWhiteKingPos, game.whiteTurn, nextStepBoard, game)
}


function _isCheck(pieceCoord, against, board, game) {
    let threatningPieces = []
    if (_kingIsAround(pieceCoord, against, board)) threatningPieces.push(..._kingIsAround(pieceCoord, against, board))
    if (_pawnIsAround(pieceCoord, against, board, game)) threatningPieces.push(..._pawnIsAround(pieceCoord, against, board, game));
    let res = _getAllPossibleCoordsRook(pieceCoord, board, game.whiteTurn)
    for (let i = 0; i < res.length; i++) {
        let posCoord = { i: res[i].i, j: res[i].j }
        let piece = board[posCoord.i][posCoord.j].piece
        if ((piece === KIT.ROOK_BLACK || piece === KIT.ROOK_WHITE ||
            piece === KIT.QUEEN_BLACK || piece === KIT.QUEEN_WHITE) && !_isWhitePiece(posCoord, board) === against) {
            threatningPieces.push(posCoord);
        }
    }
    res = _getAllPossibleCoordsBishop(pieceCoord, board, game.whiteTurn)
    for (let i = 0; i < res.length; i++) {
        let posCoord = { i: res[i].i, j: res[i].j }
        let piece = board[posCoord.i][posCoord.j].piece
        if ((piece === KIT.BISHOP_BLACK || piece === KIT.BISHOP_WHITE ||
            piece === KIT.QUEEN_BLACK || piece === KIT.QUEEN_WHITE) && !_isWhitePiece(posCoord, board) === against) {
            threatningPieces.push(posCoord);
        }
    }
    res = _getAllPossibleCoordsKnight(pieceCoord, board, game.whiteTurn)
    for (let i = 0; i < res.length; i++) {
        let posCoord = { i: res[i].i, j: res[i].j }
        let piece = board[posCoord.i][posCoord.j].piece
        if ((piece === KIT.KNIGHT_BLACK || piece === KIT.KNIGHT_WHITE) && !_isWhitePiece(posCoord, board) === against) {
            threatningPieces.push(posCoord);
        }
    }
    return (threatningPieces.length) ? threatningPieces : false
}

function _pawnIsAround(coord, against, board, game) {
    var res = []
    var pawnCoord = { i: (against) ? coord.i - 1 : coord.i + 1, j: coord.j };
    if (against === game.whiteTurn) {
        for (var j = - 1; j <= 1; j++) {
            var currPawn = { i: pawnCoord.i, j: pawnCoord.j + j }
            if ((currPawn.j < 8 && currPawn >= 0) && !_isEmptyCell(currPawn, board) && ((board[currPawn.i][currPawn.j].piece === (!against ? KIT.PAWN_WHITE : KIT.PAWN_BLACK)))) {
                var option = [..._getAllPossibleCoordsPawn(currPawn, !against, board, game)].find(obj => obj.i === coord.i && obj.j === coord.j);
                if (option) res.push(currPawn)
            }
        }
    } else {
        if (coord.i < 1 || coord.i > 6) return false
        if (pawnCoord.j > 0)
            if (board[pawnCoord.i][pawnCoord.j - 1].piece === ((against) ? KIT.PAWN_BLACK : KIT.PAWN_WHITE)) res.push({ i: pawnCoord.i, j: pawnCoord.j - 1 })
        if (pawnCoord.j < 7)
            if (board[pawnCoord.i][pawnCoord.j + 1].piece === ((against) ? KIT.PAWN_BLACK : KIT.PAWN_WHITE)) res.push({ i: pawnCoord.i, j: pawnCoord.j + 1 })
    }
    return res.length ? res : false;
}


function _kingIsAround(coord, against, board) {
    var res = []
    for (var i = coord.i - 1; i <= coord.i + 1; i++) {
        if (i < 0 || i >= 8) continue;
        for (var j = coord.j - 1; j <= coord.j + 1; j++) {
            if (i === coord.i && j === coord.j) continue;
            if (j < 0 || j >= 8) continue;
            var aroundCoord = { i: i, j: j };
            if (!_isEmptyCell(aroundCoord, board) && _isWhitePiece(aroundCoord, board) === against) continue;
            if (board[i][j].piece === ((against) ? KIT.KING_BLACK : KIT.KING_WHITE)) res.push(aroundCoord)
        }
    }
    return res.length ? res : false
}


function _getAllPossibleCoords(piece, cellCoord, game) {
    var possibleCoords = []
    switch (piece) {
        case KIT.ROOK_WHITE:
        case KIT.ROOK_BLACK:
            possibleCoords = _getAllPossibleCoordsRook(cellCoord, game.gameBoard, game.whiteTurn);
            break;
        case KIT.BISHOP_WHITE:
        case KIT.BISHOP_BLACK:
            possibleCoords = _getAllPossibleCoordsBishop(cellCoord, game.gameBoard, game.whiteTurn);
            break;
        case KIT.KNIGHT_WHITE:
        case KIT.KNIGHT_BLACK:
            possibleCoords = _getAllPossibleCoordsKnight(cellCoord, game.gameBoard, game.whiteTurn);
            break;
        case KIT.PAWN_WHITE:
        case KIT.PAWN_BLACK:
            possibleCoords = _getAllPossibleCoordsPawn(cellCoord, game.whiteTurn, game.gameBoard, game);
            break;
        case KIT.QUEEN_WHITE:
        case KIT.QUEEN_BLACK:
            possibleCoords = _getAllPossibleCoordsQueen(cellCoord, game.gameBoard, game.whiteTurn);
            break;
        case KIT.KING_WHITE:
        case KIT.KING_BLACK:
            possibleCoords = _getAllPossibleCoordsKing(cellCoord, game);
            break;
        default: return possibleCoords
    }
    return possibleCoords;
}


function _getAllPossibleCoordsPawn(pieceCoord, against, board, game) {
    var res = [];
    var isWhite = board[pieceCoord.i][pieceCoord.j].piece === KIT.PAWN_WHITE
    var diff = (isWhite) ? -1 : 1;
    var nextCoord = { i: pieceCoord.i + diff, j: pieceCoord.j };
    var diago1Coord = { i: pieceCoord.i + diff, j: pieceCoord.j + 1 }
    var diago2Coord = { i: pieceCoord.i + diff, j: pieceCoord.j - 1 }
    if (((diago1Coord.j < 8 && !_isEmptyCell(diago1Coord, board) && (_isWhitePiece(diago1Coord, board) !== against)) ||
        _isEnPassant(diago1Coord, pieceCoord, against, isWhite, board, game)) && pieceCoord.j + 1 < 8)
        res.push(diago1Coord)
    if (((diago2Coord.j >= 0 && !_isEmptyCell(diago2Coord, board) && (_isWhitePiece(diago2Coord, board) !== against)) ||
        _isEnPassant(diago2Coord, pieceCoord, against, isWhite, board, game)) && pieceCoord.j - 1 >= 0)
        res.push(diago2Coord)
    if (_isEmptyCell(nextCoord, board) && against === game.whiteTurn) res.push(nextCoord);
    else return res;
    if ((pieceCoord.i === 1 && !isWhite) || (pieceCoord.i === 6 && isWhite)) {
        diff *= 2;
        nextCoord = { i: pieceCoord.i + diff, j: pieceCoord.j };
        if (_isEmptyCell(nextCoord, board)) res.push(nextCoord);
    }
    return res;
}


function _isEnPassant(diagoCoord, pieceCoord, against, isWhite, board, game) {
    if (game.blackPlayer.lastMove.fromCoord === null || diagoCoord.j > 7 || diagoCoord.j < 0) return
    return (_isEmptyCell(diagoCoord, board) &&
        ((pieceCoord.i === 3 && isWhite) || (pieceCoord.i === 4 && !isWhite)) &&
        (board[pieceCoord.i][diagoCoord.j].piece === (!against ? KIT.PAWN_WHITE : KIT.PAWN_BLACK)) &&
        (isWhite ? (game.blackPlayer.lastMove.fromCoord.j === game.blackPlayer.lastMove.toCoord.j && Math.abs(game.blackPlayer.lastMove.fromCoord.i - game.blackPlayer.lastMove.toCoord.i) === 2) :
            (game.whitePlayer.lastMove.fromCoord.j === game.whitePlayer.lastMove.toCoord.j && Math.abs(game.whitePlayer.lastMove.fromCoord.i - game.whitePlayer.lastMove.toCoord.i) === 2)) &&
        ((pieceCoord.i === (isWhite ? game.blackPlayer.lastMove.toCoord.i : game.whitePlayer.lastMove.toCoord.i) &&
            diagoCoord.j === (isWhite ? game.blackPlayer.lastMove.toCoord.j : game.whitePlayer.lastMove.toCoord.j))))
}


function _getAllPossibleCoordsRook(pieceCoord, board, whiteTurn) {
    let res = [];
    for (let dir = 0; dir < 4; dir++) {
        for (let i = _getDirection(dir, pieceCoord); (dir % 2 === 0) ? i >= 0 : i < 8; (dir % 2 === 0) ? i-- : i++) {
            var coord = (dir < 2) ? { i, j: pieceCoord.j } : { i: pieceCoord.i, j: i };
            if (!_isEmptyCell(coord, board)) {
                if (_isWhitePiece(coord, board) === whiteTurn) break;
                else {
                    res.push(coord);
                    break;
                }
            }
            res.push(coord);
        }
    }
    return res;
}


function _getAllPossibleCoordsBishop(pieceCoord, board, whiteTurn) {
    var res = [];
    for (let dir = 0; dir < 4; dir++) {
        var i = pieceCoord.i + (dir < 2 ? -1 : 1);
        for (var idx = pieceCoord.j + (dir % 2 === 0 ? 1 : -1); ((dir < 2) ? (i >= 0) : (i < 8)) && ((dir % 2 === 0) ? (idx < 8) : (idx >= 0)); (dir % 2 === 0) ? idx++ : idx--) {
            var coord = { i: (dir < 2) ? i-- : i++, j: idx };
            if (!_isEmptyCell(coord, board)) {
                if (_isWhitePiece(coord, board) === whiteTurn) break;
                else {
                    res.push(coord);
                    break;
                }
            }
            res.push(coord);
        }
    }
    return res;
}


function _getDirection(dir, pieceCoord) {
    return ((dir < 2) ? pieceCoord.i : pieceCoord.j) + ((dir % 2 === 0) ? -1 : 1);
}


function _getAllPossibleCoordsQueen(pieceCoord, board, whiteTurn) {
    let diagonals = _getAllPossibleCoordsBishop(pieceCoord, board, whiteTurn)
    return _getAllPossibleCoordsRook(pieceCoord, board, whiteTurn).concat(diagonals)
}


function _getAllPossibleCoordsKnight(pieceCoord, board, whiteTurn) {
    var res = [];
    for (var i = pieceCoord.i - 2; i <= pieceCoord.i + 2; i++) {
        if (i === pieceCoord.i) continue;
        if (i < 0 || i >= 8) continue;
        for (var j = pieceCoord.j - 2; j <= pieceCoord.j + 2; j++) {
            if (i === pieceCoord.i && j === pieceCoord.j) continue;
            if (j < 0 || j >= 8) continue;
            var coord = { i: i, j: j };
            if (!_isEmptyCell(coord, board) && _isWhitePiece(coord, board) === whiteTurn) continue;
            if ((Math.abs(pieceCoord.i - i) + Math.abs(pieceCoord.j - j)) === 3) res.push(coord);
        }
    }
    return res;
}


function _getAllPossibleCoordsKing(pieceCoord, game) {
    let res = [];
    let board = game.gameBoard
    for (let i = pieceCoord.i - 1; i <= pieceCoord.i + 1; i++) {
        if (i < 0 || i >= 8) continue;
        for (var j = pieceCoord.j - 1; j <= pieceCoord.j + 1; j++) {
            if (i === pieceCoord.i && j === pieceCoord.j) continue;
            if (j < 0 || j >= 8) continue;
            var coord = { i: i, j: j };
            if (!_isEmptyCell(coord, board) && _isWhitePiece(coord, board) === game.whiteTurn) continue;
            if (_isCheck(coord, game.whiteTurn, game.gameBoard, game)) continue;
            res.push(coord);
            if ((j === 5 || j === 3) && (i === 0 || i === 7)) {
                _getPossibleCasteling(game, coord, res)
            }
        }
    }
    return res;
}


function _getPossibleCasteling(game, coord, res) {
    let board = game.gameBoard
    if (game.whiteTurn && !game.whitePlayer.kingMoved) {
        if (coord.j === 5 && _isEmptyCell({ i: coord.i, j: coord.j + 1 }, board) &&
            !_isCheck({ i: coord.i, j: coord.j + 1 }, game.whiteTurn, board, game))
            res.push({ i: coord.i, j: coord.j + 1 })
        else if (_isEmptyCell({ i: coord.i, j: coord.j - 1 }, board) &&
            !_isCheck({ i: coord.i, j: coord.j - 1 }, game.whiteTurn, board, game))
            res.push({ i: coord.i, j: coord.j - 1 })
    } else if (!game.whiteTurn && !game.whitePlayer.kingMoved) {
        if (coord.j === 5 && _isEmptyCell({ i: coord.i, j: coord.j + 1 }, board) &&
            !_isCheck({ i: coord.i, j: coord.j + 1 }, game.whiteTurn, board, game))
            res.push({ i: coord.i, j: coord.j + 1 })
        else if (_isEmptyCell({ i: coord.i, j: coord.j - 1 }, board) &&
            !_isCheck({ i: coord.i, j: coord.j - 1 }, game.whiteTurn, board, game))
            res.push({ i: coord.i, j: coord.j - 1 })
    }
}


function _updateKingsMoved(piece, toCoord, game) {
    let board = game.gameBoard
    if (piece === KIT.KING_WHITE) {
        let gWP = game.whitePlayer
        gWP.kingPos = { i: toCoord.i, j: toCoord.j }
        if (!gWP.kingMoved) { //TODO: add condition close rook not moved
            if (toCoord.j === 6) {
                board[7][7].piece = '';
                board[7][7].isWhite = undefined;
                board[7][5].piece = KIT.ROOK_WHITE;
                board[7][5].isWhite = true;
            } else if (toCoord.j === 2) {
                board[7][0].piece = '';
                board[7][0].isWhite = undefined;
                board[7][3].piece = KIT.ROOK_WHITE;
                board[7][3].isWhite = true;
            }
            gWP.kingMoved = true
        }
    }
    else if (piece === KIT.KING_BLACK) {
        let gBP = game.blackPlayer
        gBP.kingPos = { i: toCoord.i, j: toCoord.j }
        if (!gBP.kingMoved) { //TODO: add condition close rook not moved
            if (toCoord.j === 6) {
                board[0][7].piece = '';
                board[0][7].isWhite = undefined;
                board[0][5].piece = KIT.ROOK_BLACK;
                board[0][5].isWhite = false;
            } else if (toCoord.j === 2) {
                board[0][0].piece = '';
                board[0][0].isWhite = undefined;
                board[0][3].piece = KIT.ROOK_BLACK;
                board[0][3].isWhite = false;
            }
            gBP.kingMoved = true
        }
    }
}

function _updateRooksMoved(piece, coord, game) {
    let gWP = game.whitePlayer
    let gBP = game.blackPlayer
    if (piece === KIT.ROOK_BLACK) {
        (coord.j === 7) ? gBP.closeRookMoved = true : gBP.farRookMoved = true;
    } else if (piece === KIT.ROOK_WHITE) {
        (coord.j === 7) ? gWP.closeRookMoved = true : gWP.farRookMoved = true;
    }
}


function _isCheckMate(kingPosition, game) {
    if (_getAllPossibleCoordsKing(kingPosition, game).length === 0 && _isCheck(kingPosition, game.whiteTurn, game.gameBoard, game).length > 1) return true
    else if ((_getAllPossibleCoordsKing(kingPosition, game).length === 0 && _isCheck(kingPosition, game.whiteTurn, game.gameBoard, game).length === 1)) {
        let board = game.gameBoard
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j].piece === '' || !game.whiteTurn === _isWhitePiece({ i, j }, board)) continue;
                if (_getAllPossibleCoords(board[i][j].piece, { i, j }, game).filter(toCoord => !_nextStepModal({ i, j }, toCoord, game)).length !== 0) {
                    return false
                }
            }
        }
        return true
    }
}


function _isEmptyCell(coord, board) {
    return board[coord.i][coord.j].piece === ''
}


function _isWhitePiece(coord, board) {
    return board[coord.i][coord.j].isWhite
}


function _isPawnAQueen(coord, piece) {
    if (piece === KIT.PAWN_BLACK && coord.i === 7) return KIT.QUEEN_BLACK
    else if (piece === KIT.PAWN_WHITE && coord.i === 0) return KIT.QUEEN_WHITE
    else return piece
}

function _cleanBoard(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            if (board[i][j].isMarked) board[i][j].isMarked = false
            if (board[i][j].isSelected) board[i][j].isSelected = false
        }
    }
}
