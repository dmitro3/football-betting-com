import routerx from 'express-promise-router';
import { checkUser, verifyToken } from '../../middlewares/auth';
import { turn, list, history } from '../../controllers/games';
import rateLimit from 'express-rate-limit';
import slots from './slots';
const router = routerx();

const Mlimiter = rateLimit({
    windowMs: 200,
    max: 1,
    standardHeaders: true,
    legacyHeaders: false
});

router.post('/list', list);
router.post('/turn', Mlimiter, verifyToken, checkUser, turn);
router.post('/history', history);

router.use('/slots', verifyToken, slots);

export default router;
