import { Stack } from '@mui/material';
import { useSelector } from 'store';

const Slots = () => {
    const { token, isLoggedIn } = useSelector((state) => state.auth);
    if (!isLoggedIn) return <div>token invalid</div>;
    return (
        <Stack className="game-container game-diamonds" sx={{ '@media (max-width:767px)': { flexDirection: 'column' } }}>
            <iframe
                title="slots"
                style={{ height: '600px', width: '100%', border: 'none' }}
                src={`${process.env.REACT_APP_PROVIDER_URL}/game?gameID=1548&token=${token}&opid=${process.env.REACT_APP_OPID}`}
            />
        </Stack>
    );
};

export default Slots;
