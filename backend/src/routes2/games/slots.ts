import routerx from 'express-promise-router';
import { auth, debit } from '../../controllers/games/slots';
import { verifyToken } from '../../middlewares/auth';
const router = routerx();

router.post('/auth', verifyToken, auth);
router.post('/debit', verifyToken, debit);

export default router;
