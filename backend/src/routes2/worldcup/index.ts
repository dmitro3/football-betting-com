import routerx from 'express-promise-router';
import { V, Validator } from '../../middlewares/validation';
import { checkUser, verifyToken } from '../../middlewares/auth';
import { createBetRoom, getRoom, joinBetRoom } from '../../controllers/worldcup';
const router = routerx();

router.post('/create-bet', V.body(Validator.WorldCup.Bet.Create), verifyToken, createBetRoom);
router.post('/join-bet', V.body(Validator.WorldCup.Bet.Join), verifyToken, joinBetRoom);
router.post('/getRoom', V.body(Validator.WorldCup.Bet.GetRoom), getRoom);

export default router;
