import { number } from 'joi';
import { Schema, model } from 'mongoose';

const betroomSchema = new Schema(
    {
        user1Id: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        user1Winner: {
            type: String
        },
        user1Balance: {
            type: Number
        },
        user1Odds: {
            type: Number
        },
        user2Id: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        user2Winner: {
            type: String
        },
        user2Balance: {
            type: Number
        },
        user2Odds: {
            type: Number
        },
        user3Id: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        user3Winner: {
            type: String
        },
        user3Balance: {
            type: Number
        },
        user3Odds: {
            type: Number
        },
        eventId: {
            type: Number
        },
        currency: {
            type: Schema.Types.ObjectId,
            ref: 'currencies'
        },
        finished: {
            type: Boolean,
            default: false
        },
        bet2: {
            //for 2 players bet
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export const BetRooms = model('betrooms', betroomSchema);
