import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Divider, Grid, Stack, Typography, useMediaQuery } from '@mui/material';
// import { FormattedMessage } from 'react-intl';

import moment from 'moment';

import { BASE_URL } from 'config';
import useConfig from 'hooks/useConfig';
import { EventProps, OddTypes } from 'types/sports';
import { checkActive, getIsLock, getMarkets } from 'utils/sports';

import { useSelector } from 'store';
// import { setBetslip } from 'store/reducers/sports';

import { Lock, OddWarraper, TeamAvatar, TeamName } from 'ui-component';
import OddNum from './OddNum';
import snackbar from 'utils/snackbar';

const Event = ({ event, activeSports, isLive }: EventProps) => {
    const { locale } = useConfig();
    moment.locale(locale);
    const navigate = useNavigate();
    // const dispatch = useDispatch();
    const location = useLocation();
    const { drawerOpen } = useSelector((state) => state.menu);
    const isMobile = useMediaQuery(`(max-width:${drawerOpen ? 1024 : 767}px)`);
    const { betslipData } = useSelector((state) => state.sports);
    const { marketOne } = getMarkets(event, activeSports);
    // const name = getName(activeSports);

    // const eventsHandler = () => {
    //     navigate(`/events/${event.id}`, { state: { prevPath: location.pathname } });
    // };

    const betsHandler = async () => {
        if (
            (marketOne && marketOne.home_od !== '-' && marketOne.draw_od) ||
            (marketOne && marketOne.home_od !== '-' && !marketOne.draw_od)
        ) {
            navigate(`/bets/${event.id}`, { state: { prevPath: location.pathname } });
        } else {
            snackbar('This Game is locked!', 'error');
        }
    };
    // const betHandler = (odd: any, oddType: OddTypes) => {
    //     if (!activeSports) return;
    //     const betslip = convertBetslipData({ event, odd, oddType, sports: activeSports });
    //     dispatch(setBetslip(addRemoveBetslip(betslipData, betslip)));
    // };

    const MarketOneItem = (props: any) => {
        const { update, oddnum } = props;
        return (
            <Box
                bgcolor="#ffffff2e"
                borderRadius="5px"
                sx={{
                    WebkitBoxShadow: '0px 10px 13px -7px #000000, 5px 5px 15px 5px rgb(0 0 0 / 0%)'
                }}
                color="white"
            >
                <OddWarraper
                    gridColumn="span 4"
                    update={update}
                    sx={{ justifyContent: 'center', padding: '5px 5%' }}
                    // onClick={() => betHandler(marketOne, OddTypes.Home)}
                    active={checkActive(betslipData, marketOne.id, OddTypes.Home)}
                >
                    <OddNum odd={oddnum} />
                </OddWarraper>
                {/* <Stack flexDirection="column">
                    <Grid container p={1}>
                        <Grid item xs={8} sm={8} m="auto" fontSize={isMobile ? '12px' : '15px'} textAlign="center" color="#b9b9b9">
                            Amount Bet:
                        </Grid>
                        <Grid item xs={4} sm={4} m="auto" textAlign="center">
                            1 <span style={{ fontSize: '10px' }}>{currency.symbol}</span>
                        </Grid>
                    </Grid>
                    <Grid container p={1}>
                        <Grid item xs={8} sm={8} m="auto" fontSize={isMobile ? '12px' : '15px'} textAlign="center" color="#b9b9b9">
                            Amount to Win:
                        </Grid>
                        <Grid item xs={4} sm={4} m="auto" color="#00ff37" textAlign="center">
                            {Number(oddnum)} <span style={{ fontSize: '10px', color: 'white' }}>{currency.symbol}</span>
                        </Grid>
                    </Grid>
                </Stack> */}
            </Box>
        );
    };

    const MarketOne = () => {
        if (getIsLock({ isLive, item: marketOne, sports: activeSports, event })) {
            return <Lock />;
        }
        if (marketOne && marketOne.home_od !== '-' && marketOne.draw_od) {
            return (
                <>
                    <Grid item xs={4} sm={4} p="1%">
                        <MarketOneItem update={marketOne?.update1} oddnum={marketOne.home_od} />
                    </Grid>
                    <Grid item xs={4} sm={4} p="1%">
                        <MarketOneItem update={marketOne?.update3} oddnum={marketOne.draw_od} />
                    </Grid>
                    <Grid item xs={4} sm={4} p="1%">
                        <MarketOneItem update={marketOne?.update2} oddnum={marketOne.away_od} />
                    </Grid>
                </>
            );
        }
        if (marketOne && marketOne.home_od !== '-' && !marketOne.draw_od) {
            return (
                <>
                    <Grid item xs={6} sm={6}>
                        <OddWarraper
                            gridColumn="span 6"
                            update={marketOne?.update1}
                            sx={{ justifyContent: 'center' }}
                            // onClick={() => betHandler(marketOne, OddTypes.Home)}
                            active={checkActive(betslipData, marketOne.id, OddTypes.Home)}
                        >
                            <OddNum odd={marketOne.home_od} />
                        </OddWarraper>
                    </Grid>
                    <Grid item xs={6} sm={6}>
                        <OddWarraper
                            gridColumn="span 6"
                            update={marketOne?.update2}
                            sx={{ justifyContent: 'center' }}
                            // onClick={() => betHandler(marketOne, OddTypes.Away)}
                            active={checkActive(betslipData, marketOne.id, OddTypes.Away)}
                        >
                            <OddNum odd={marketOne.away_od} />
                        </OddWarraper>
                    </Grid>
                </>
            );
        }
        return <Lock />;
    };

    if (isMobile) {
        return (
            <Stack
                sx={{
                    background: '#081b3f',
                    borderRadius: '18px',
                    transitionDuration: '0.3s',
                    boxShadow: '0 10px 16px 0 rgb(0 0 0 / 90%), 0 6px 20px 0 rgb(0 0 0 / 30%)',
                    '&:hover': {
                        boxShadow: '0 10px 10px 6px rgb(0 0 0 / 50%)',
                        background: '#0e295c',
                        cursor: 'pointer'
                    }
                }}
                onClick={betsHandler}
                my={1}
                px={1}
            >
                <Divider sx={{ py: 1 }} />
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography
                        sx={{
                            pt: 1,
                            px: 1,
                            fontWeight: '700',
                            fontSize: '12px',
                            lineHeight: '100%',
                            color: '#84868a'
                        }}
                    >
                        {moment(event.time * 1000).format('ddd, MMM DD, h:mm A')}
                    </Typography>
                    {/* <IconButton onClick={eventsHandler}>
                        <Typography
                            sx={{
                                fontWeight: '700',
                                fontSize: '12px',
                                lineHeight: '100%',
                                color: '#76C841'
                            }}
                        >
                            +{event?.odds && Object.keys(event.odds).length}
                        </Typography>
                    </IconButton> */}
                </Stack>
                <Stack direction="row" alignItems="center" justifyContent="space-evenly" spacing={1}>
                    <Stack spacing={0.5} alignItems="center">
                        {/* <TeamAvatar onClick={eventsHandler} alt={event.home?.name} src={`${BASE_URL}/${event.home?.image_id}.png`} />
                        <TeamName onClick={eventsHandler} sx={{ textAlign: 'center' }}>
                            {event.home?.name}
                        </TeamName> -------------update */}
                        <TeamAvatar alt={event.home?.name} src={`${BASE_URL}/${event.home?.image_id}.png`} />
                        <TeamName sx={{ textAlign: 'center' }}>{event.home?.name}</TeamName>
                    </Stack>
                    <Stack spacing={0.5} alignItems="center">
                        <TeamAvatar alt={event.away?.name} src={`${BASE_URL}/${event.away?.image_id}.png`} />
                        <TeamName sx={{ textAlign: 'center' }}>{event.away?.name}</TeamName>
                    </Stack>
                </Stack>
                {/* <Typography
                    sx={{
                        textAlign: 'center',
                        fontWeight: '700',
                        fontSize: '12px',
                        lineHeight: '100%',
                        color: '#84868a'
                    }}
                >
                    {name.name1 && <FormattedMessage id={name.name1} />}
                </Typography> */}
                <Grid container justifyContent="center">
                    {/* <Grid item>
                        <Button
                            variant="contained"
                            sx={{
                                background: '#3F4357',
                                borderRadius: '3px',
                                textAlign: 'center',
                                width: '100%',
                                alignItems: 'center',
                                minHeight: '2rem',
                                cursor: 'pointer',
                                position: 'relative',
                                padding: '5px 20px',
                                color: 'white',
                                transition: 'transform 0.1s',
                                '&:hover': {
                                    background: '#2196f309'
                                },
                                '&:active': {
                                    transform: 'scale(0.95)'
                                }
                            }}
                            onClick={betsHandler}
                        >
                            Join Game
                        </Button>
                    </Grid> */}
                    <MarketOne />
                </Grid>
                <br />
            </Stack>
        );
    }
    return (
        <Grid
            sx={{
                background: '#081b3f',
                borderRadius: '18px',
                transitionDuration: '0.3s',
                boxShadow: '0 10px 16px 0 rgb(0 0 0 / 90%), 0 6px 20px 0 rgb(0 0 0 / 30%)',
                '&:hover': {
                    boxShadow: '0 10px 10px 6px rgb(0 0 0 / 50%)',
                    // WebkitTransform: 'scale(1.1)',
                    background: '#0e295c',
                    cursor: 'pointer'
                }
            }}
            p={2}
            onClick={betsHandler}
        >
            <Box
                display="grid"
                gridTemplateColumns="repeat(12, 1fr)"
                sx={{
                    mt: 1.5,
                    mb: 2
                }}
            >
                <Box gridColumn="span 5">
                    <Box
                        sx={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            display: 'flex'
                        }}
                    >
                        <Typography
                            sx={{
                                pl: { xs: 0, sm: 1 },
                                pr: { xs: 0.5, sm: 2 },
                                fontWeight: '700',
                                fontSize: '16px',
                                lineHeight: '100%',
                                color: '#84868a'
                            }}
                        >
                            {moment(event.time * 1000).format('ddd, MMM DD, h:mm A')}
                        </Typography>
                    </Box>
                </Box>
            </Box>
            <Grid container justifyContent="space-between">
                <Grid item xs={4} sm={4} display="flex" justifyContent="center" alignItems="center">
                    <TeamName>{event.home?.name}</TeamName>
                </Grid>

                <Grid item xs={4} sm={4} display="flex" justifyContent="center" alignItems="center">
                    <TeamName>{event.away?.name}</TeamName>
                </Grid>
            </Grid>
            <Grid container justifyContent="space-between">
                <Grid item xs={4} sm={4} display="flex" justifyContent="center" alignItems="center">
                    <TeamAvatar
                        // onClick={eventsHandler}
                        sx={{ WebkitBoxShadow: '0px -1px 8px 5px rgb(187 98 98 / 16%)' }}
                        alt={event.home?.name}
                        src={`${BASE_URL}/${event.home?.image_id}.png`}
                    />
                </Grid>
                <Grid item xs={4} sm={4} display="flex" fontSize="45px" color="white" justifyContent="center" alignItems="center">
                    0 - 0
                </Grid>
                <Grid item xs={4} sm={4} display="flex" justifyContent="center" alignItems="center">
                    <TeamAvatar
                        // onClick={eventsHandler}
                        sx={{ WebkitBoxShadow: '0px -1px 8px 5px rgb(187 98 98 / 16%)' }}
                        alt={event.away?.name}
                        src={`${BASE_URL}/${event.away?.image_id}.png`}
                    />
                </Grid>
            </Grid>
            <Grid container justifyContent="center">
                {/* <Grid item>
                    <Button
                        variant="contained"
                        sx={{
                            background: '#3F4357',
                            borderRadius: '3px',
                            textAlign: 'center',
                            width: '100%',
                            alignItems: 'center',
                            minHeight: '2rem',
                            cursor: 'pointer',
                            position: 'relative',
                            padding: '5px 20px',
                            color: 'white',
                            transition: 'transform 0.1s',
                            '&:hover': {
                                background: '#2196f309'
                            },
                            '&:active': {
                                transform: 'scale(0.95)'
                            }
                        }}
                        onClick={betsHandler}
                    >
                        Join Game
                    </Button>
                </Grid> */}
                <MarketOne />
                {/* <Grid item xs={1} sm={1}>
                    <Stack justifyContent="center" alignItems="center" sx={{ height: '100%' }}>
                        <IconButton onClick={eventsHandler}>
                            <Typography
                                sx={{
                                    fontWeight: '700',
                                    fontSize: '12px',
                                    lineHeight: '100%',
                                    color: '#76C841'
                                }}
                            >
                                +{event?.odds && Object.keys(event.odds).length}
                            </Typography>
                        </IconButton>
                    </Stack>
                </Grid> */}
            </Grid>
        </Grid>
    );
};

export default Event;
