import * as md5 from 'md5';
import * as moment from 'moment';
import * as request from 'request';
import { Request, Response } from 'express';
import { checkBalance, generatInfo, getActiveBet, handleBet, NumberFix, ObjectId } from '../base';
import {
    SportsBets,
    Sessions,
    Balances,
    SportsBetting,
    SportsLists,
    SportsMatchs,
    Users,
    BetRooms,
    Currencies,
    SportsEndMatchs
} from '../../models';

export const createBetRoom = async (req: Request, res: Response) => {
    const { token, id, amount, winner, bet2 } = req.body;
    console.log(bet2, '//bet2');
    const sessions = await Sessions.findOne({
        accessToken: token
    });
    if (!sessions) return res.status(400).json('Your token is not valid');

    const balance = await Balances.findOne({
        userId: sessions.userId,
        status: true
    });
    if (!balance) return res.status(400).json('Your balance is not valid');

    const sportsMatch = await SportsMatchs.findOne({
        id: id
    });
    if (!sportsMatch) return res.status(400).json('Game is not valid');

    if (bet2 && winner == '2') return res.status(400).json('You are a fake');

    let data = {};

    const home_od = Number(sportsMatch.odds['1_1']['home_od']),
        draw_od = Number(sportsMatch.odds['1_1']['draw_od']),
        away_od = Number(sportsMatch.odds['1_1']['away_od']);

    if (winner == '1') {
        if (!bet2) {
            data = {
                user1Id: sessions.userId,
                user1Winner: winner,
                user1Balance: amount,
                user1Odds: home_od,
                user2Balance: formatBalance(amount, home_od, draw_od),
                user2Odds: draw_od,
                user3Balance: formatBalance(amount, home_od, away_od),
                user3Odds: away_od,
                eventId: id,
                currency: balance.currency._id,
                finished: false,
                bet2: false
            };
        } else if (bet2) {
            data = {
                user1Id: sessions.userId,
                user1Winner: winner,
                user1Balance: amount,
                user1Odds: toFixed((home_od + away_od) / away_od, 3),
                user3Balance: formatBalance(amount, toFixed((home_od + away_od) / away_od, 3), toFixed((home_od + away_od) / home_od, 3)),
                user3Odds: toFixed((home_od + away_od) / home_od, 3),
                eventId: id,
                currency: balance.currency._id,
                finished: false,
                bet2: true
            };
        }
    } else if (winner == '2') {
        data = {
            user2Id: sessions.userId,
            user2Winner: winner,
            user2Balance: amount,
            user2Odds: draw_od,
            user1Balance: formatBalance(amount, draw_od, home_od),
            user1Odds: home_od,
            user3Balance: formatBalance(amount, draw_od, away_od),
            user3Odds: away_od,
            eventId: id,
            currency: balance.currency._id,
            finished: false,
            bet2: false
        };
    } else if (winner == '0') {
        if (!bet2) {
            data = {
                user3Id: sessions.userId,
                user3Winner: winner,
                user3Balance: amount,
                user3Odds: away_od,
                user1Balance: formatBalance(amount, away_od, home_od),
                user1Odds: home_od,
                user2Balance: formatBalance(amount, away_od, draw_od),
                user2Odds: draw_od,
                eventId: id,
                currency: balance.currency._id,
                finished: false,
                bet2: false
            };
        } else if (bet2) {
            data = {
                user3Id: sessions.userId,
                user3Winner: winner,
                user3Balance: amount,
                user3Odds: toFixed((home_od + away_od) / home_od, 3),
                user1Balance: formatBalance(amount, toFixed((home_od + away_od) / home_od, 3), toFixed((home_od + away_od) / away_od, 3)),
                user1Odds: toFixed((home_od + away_od) / away_od, 3),
                eventId: id,
                currency: balance.currency._id,
                finished: false,
                bet2: true
            };
        }
    } else return res.status(400).json('Your winner is not valid');

    const betRoom = new BetRooms(data);
    await betRoom.save();

    const me = await BetRooms.findOne().sort({ createdAt: -1 });
    const user = await Users.findById(sessions.userId);

    let result;
    if (winner == '1') {
        result = {
            id: me._id,
            user1: {
                id: user._id,
                username: user.username,
                avatar: user.avatar,
                winner: winner,
                balance: amount,
                odds: me.user1Odds
            },
            user2: {
                balance: me.user2Balance,
                odds: me.user2Odds
            },
            user3: {
                balance: me.user3Balance,
                odds: me.user3Odds
            },
            eventId: id,
            currency: {
                id: balance.currency._id,
                symbol: balance.currency.symbol,
                icon: balance.currency.icon
            },
            bet2: me.bet2
        };
    } else if (winner == '2') {
        result = {
            id: me._id,
            user2: {
                id: user._id,
                username: user.username,
                avatar: user.avatar,
                winner: winner,
                balance: amount,
                odds: me.user2Odds
            },
            user1: {
                balance: me.user1Balance,
                odds: me.user1Odds
            },
            user3: {
                balance: me.user3Balance,
                odds: me.user3Odds
            },
            eventId: id,
            currency: {
                id: balance.currency._id,
                symbol: balance.currency.symbol,
                icon: balance.currency.icon
            },
            bet2: me.bet2
        };
    } else if (winner == '0') {
        result = {
            id: me._id,
            user3: {
                id: user._id,
                username: user.username,
                avatar: user.avatar,
                winner: winner,
                balance: amount,
                odds: me.user3Odds
            },
            user1: {
                balance: me.user1Balance,
                odds: me.user1Odds
            },
            user2: {
                balance: me.user2Balance,
                odds: me.user2Odds
            },
            eventId: id,
            currency: {
                id: balance.currency._id,
                symbol: balance.currency.symbol,
                icon: balance.currency.icon
            },
            bet2: me.bet2
        };
    }
    req.app.get('io').emit('createRoom', { data: result });

    await handleBet({
        req,
        currency: balance.currency._id,
        userId: sessions.userId,
        amount: -amount,
        type: me.bet2 ? 'create-bet (2bet)' : 'create-bet (3bet)',
        info: me._id
    });

    res.json({ status: 200, message: 'success' });
};

export const joinBetRoom = async (req: Request, res: Response) => {
    const { token, id, roomId, winner } = req.body;

    const sessions = await Sessions.findOne({
        accessToken: token
    });
    if (!sessions) {
        res.status(400).json('Your token is not valid');
        return;
    }

    const room = await BetRooms.findById(ObjectId(roomId));
    if (!room) {
        res.status(400).json('Your Room is not valid');
        return;
    }
    const user = await Users.findById(sessions.userId);
    if (!user) {
        res.status(400).json('You is not exists');
        return;
    }

    let query, result, amount;
    if (winner == 1) {
        query = {
            user1Id: sessions.userId,
            user1Winner: winner
        };

        result = {
            id: roomId,
            user1: {
                id: user._id,
                username: user.username,
                avatar: user.avatar,
                winner: winner,
                balance: room.user1Balance,
                odds: room.user1Odds
            },
            eventId: id
        };

        amount = room.user1Balance;
    } else if (winner == 2 && !room.bet2) {
        query = {
            user2Id: sessions.userId,
            user2Winner: winner
        };

        result = {
            id: roomId,
            user2: {
                id: user._id,
                username: user.username,
                avatar: user.avatar,
                winner: winner,
                balance: room.user2Balance,
                odds: room.user2Odds
            },
            eventId: id
        };

        amount = room.user2Balance;
    } else if (winner == 0) {
        query = {
            user3Id: sessions.userId,
            user3Winner: winner
        };

        result = {
            id: roomId,
            user3: {
                id: user._id,
                username: user.username,
                avatar: user.avatar,
                winner: winner,
                balance: room.user3Balance,
                odds: room.user3Odds
            },
            eventId: id
        };

        amount = room.user3Balance;
    }

    await BetRooms.updateOne({ _id: ObjectId(roomId) }, query);

    req.app.get('io').emit('joinRoom', { data: result });

    await handleBet({
        req,
        currency: room.currency,
        userId: sessions.userId,
        amount: -amount,
        type: room.bet2 ? 'join-bet(2bet)' : 'join-bet(3bet)',
        info: roomId
    });

    res.json({ status: 200, message: 'success' });
};

export const getRoom = async (req: Request, res: Response) => {
    const { id } = req.body;
    const betRoomes = await BetRooms.find({
        eventId: id
    }).sort({ createdAt: 1 });

    if (!betRoomes.length) {
        res.json({ status: 200, data: [] });
        return;
    }

    let Rooms = Array();
    betRoomes.map(async (row: any, index: number) => {
        let room = {
            id: row._id,
            user1: {},
            user2: {},
            user3: {},
            currency: {},
            bet2: row.bet2
        };
        if (row.user1Id) {
            const user1 = await Users.findById(row.user1Id);
            room.user1 = {
                id: user1?._id,
                username: user1?.username,
                avatar: user1?.avatar,
                winner: row.user1Winner,
                balance: NumberFix(row.user1Balance, 5),
                odds: row.user1Odds
            };
        } else
            room.user1 = {
                balance: NumberFix(row.user1Balance, 5),
                odds: row.user1Odds
            };
        if (row.bet2 == false) {
            if (row.user2Id) {
                const user2 = await Users.findById(row.user2Id);
                room.user2 = {
                    id: user2?._id,
                    username: user2?.username,
                    avatar: user2?.avatar,
                    winner: row.user2Winner,
                    balance: NumberFix(row.user2Balance, 5),
                    odds: row.user2Odds
                };
            } else
                room.user2 = {
                    balance: NumberFix(row.user2Balance, 5),
                    odds: row.user2Odds
                };
        }

        if (row.user3Id) {
            const user3 = await Users.findById(row.user3Id);
            room.user3 = {
                id: user3?._id,
                username: user3?.username,
                avatar: user3?.avatar,
                winner: row.user3Winner,
                balance: NumberFix(row.user3Balance, 5),
                odds: row.user3Odds
            };
        } else
            room.user3 = {
                balance: NumberFix(row.user3Balance, 5),
                odds: row.user3Odds
            };
        const currency = await Currencies.findById(row.currency);
        room.currency = {
            id: currency?._id,
            symbol: currency?.symbol,
            icon: currency?.icon
        };
        Rooms.push(room);
    });

    setTimeout(() => {
        res.json({ status: 200, data: Rooms });
    }, 200);
};

export const endsMatch = async () => {
    const result = await BetRooms.aggregate([
        { $match: { finished: false } },
        // { $group: { _id: '$eventId' } },
        {
            $lookup: {
                from: 'sports_end_matchs',
                localField: 'eventId',
                foreignField: 'id',
                as: 'matchs'
            }
        },
        {
            $unwind: '$matchs'
        },
        {
            $match: {
                'matchs.time_status': 3
            }
        }
    ]);
    console.log(result, '//resultendMatch');
    result.map(async (row, ind) => {
        const home = Number(row.matchs.ss.split('-')[0]);
        const away = Number(row.matchs.ss.split('-')[1]);
        if (!row.bet2 && row.user1Id && row.user2Id && row.user3Id) {
            const info = 'finish-bet win ' + row._id;
            if (home > away) {
                const amount = formatBalanceFee(row.user1Balance, row.user1Odds);
                await _handleBet(row.currency, row.user1Id, amount, info);
            } else if (home == away) {
                const amount = formatBalanceFee(row.user2Balance, row.user2Odds);
                await _handleBet(row.currency, row.user2Id, amount, info);
            } else if (home < away) {
                const amount = formatBalanceFee(row.user3Balance, row.user3Odds);
                await _handleBet(row.currency, row.user3Id, amount, info);
            }
        } else if (row.bet2 && row.user1Id && row.user3Id) {
            const info = 'finish-bet win ' + row._id;
            if (home > away) {
                const amount = formatBalanceFee(row.user1Balance, row.user1Odds);
                await _handleBet(row.currency, row.user1Id, amount, info);
            } else if (home == away) {
                const drawInfo = 'draw ' + row._id;
                await _handleBet(row.currency, row.user1Id, row.user1Balance, drawInfo);
                await _handleBet(row.currency, row.user3Id, row.user3Balance, drawInfo);
            } else if (home < away) {
                const amount = formatBalanceFee(row.user3Balance, row.user3Odds);
                await _handleBet(row.currency, row.user3Id, amount, info);
            }
        } else {
            const info = 'Bet not placed ' + row._id;
            if (row.user1Id) {
                await _handleBet(row.currency, row.user1Id, row.user1Balance, info);
            }
            if (row.user2Id) {
                await _handleBet(row.currency, row.user2Id, row.user2Balance, info);
            }
            if (row.user3Id) {
                await _handleBet(row.currency, row.user3Id, row.user3Balance, info);
            }
        }
        if (ind == result.length - 1) await BetRooms.updateMany({ eventId: row.eventId }, { finished: true });
    });
};

const formatBalance = (amount: number, odd1: number, odd2: number) => {
    return NumberFix((amount * odd1) / odd2, 5);
};

const formatBalanceFee = (balance: string, odds: string) => {
    const fee = ((Number(balance) * Number(odds) - Number(balance)) / 100) * 10;
    return Number(balance) * Number(odds) - fee;
};

const _handleBet = async (currency: string, userId: string, amount: number, info: string) => {
    console.log(userId, '/', amount);
    await handleBet({
        req: undefined,
        currency: currency,
        userId: userId,
        amount: amount,
        type: 'finish-bet',
        info: info
    });
};

const toFixed = (num: number, fixed: number) => {
    fixed = fixed || 0;
    fixed = Math.pow(10, fixed);
    return Math.floor(num * fixed) / fixed;
};
