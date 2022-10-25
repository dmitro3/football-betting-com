import { useEffect, useMemo, useState, SyntheticEvent } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';

import {
    Avatar,
    Box,
    Breadcrumbs,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    InputAdornment,
    InputLabel,
    Link,
    OutlinedInput,
    Radio,
    RadioGroup,
    Skeleton,
    Stack,
    Tab,
    Tabs,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';

import { FormattedMessage, useIntl } from 'react-intl';
import * as Yup from 'yup';
import { Formik } from 'formik';
import moment from 'moment';

import useConfig from 'hooks/useConfig';
import { useSelector } from 'store';
// import { CreateRoom } from 'store/reducers/bet';
import { BASE_URL } from 'config';
import { initEvents, MarketProps, BetRoomProps, OddTypes, SportsEventProps, SportsListProps } from 'types/sports';
import snackbar from 'utils/snackbar';

import Axios from 'utils/axios';
import { checkActive, formatData, getMarkets } from 'utils/sports';

// import Transitions from 'ui-component/extended/Transitions';
import { EventBreadcrumbs, Lock, OddWarraper, SmallTeamAvatar, TeamAvatar, TeamName } from 'ui-component';
// import GoldIcon from '../../assets/images/icons/gold.svg';
import DrawIcon from '../../assets/images/icons/draw.webp';
import Loader from 'ui-component/Loader';
import OddNum from './component/OddNum';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const BetsPage = () => {
    const theme = useTheme();
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { boxShadow } = useConfig();
    const isMobile = useMediaQuery('(max-width:882px)');
    const [loading, setLoading] = useState<boolean>(false);
    const [activeSports, setActiveSports] = useState<SportsListProps>();
    const [markets, setMarkets] = useState<MarketProps[]>([]);
    const [events, setEvents] = useState<SportsEventProps>(initEvents);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const { betslipData } = useSelector((state) => state.sports);
    // const [joinData, setJoinData] = useState<BetJoinProps>({});
    const [pageLoading, setPageLoading] = useState<boolean>(false);
    const [betRoom, setBetRoom] = useState<BetRoomProps[]>([]);
    const [tabSelect, setTabSelect] = useState(0);
    const { marketOne } = getMarkets(events, activeSports);

    const { formatMessage } = useIntl();

    const Data = useSelector((store) => store.auth);

    const { balance, currency, isLoggedIn, user, token } = Data;
    const userId = user?._id;

    const onInit = () => {
        setEvents(initEvents);
        setActiveSports({} as any);
        setMarkets([]);
    };

    useEffect(() => {
        document.getElementsByTagName('main')[0].scrollTo(0, 0);
        if (!params.id) return;
        setLoading(true);
        Axios.post('api/v1/sports/odds', { id: params.id })
            .then(({ data }) => {
                if (!data.state) {
                    onInit();
                } else {
                    setEvents(data.event);
                    setActiveSports(data.activeSports);
                    const market = formatData(data.event);
                    setMarkets(market);
                }
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });

        setPageLoading(true);
        Axios.post('api/v2/worldcup/getRoom', { id: params.id })
            .then(({ data }) => {
                if (!data.state) {
                    setBetRoom(data.data);
                } else {
                    setEvents(data.event);
                }
                setPageLoading(false);
            })
            .catch(() => {
                setPageLoading(false);
            });
    }, [params]);

    useMemo(() => {
        if (!params.id) return;
        const socket = io(BASE_URL);
        socket.on('createRoom', (data) => {
            if (Number(params.id) === data.data.eventId) {
                const ary: BetRoomProps = {
                    id: data.data.id,
                    currency: data.data.currency,
                    user1: data.data.user1,
                    user2: data.data.user2,
                    user3: data.data.user3,
                    bet2: data.data.bet2
                };
                setBetRoom([...betRoom, ary]);
            }
            socket.off('createRoom');
        });

        socket.on('joinRoom', (data) => {
            if (Number(params.id) === data.data.eventId) {
                const room = betRoom.filter((item) => item.id === data.data.id);
                if (room.length) {
                    if (data.data.user1) {
                        room[0].user1 = data.data.user1;
                    } else if (data.data.user2) {
                        room[0].user2 = data.data.user2;
                    } else if (data.data.user3) {
                        room[0].user3 = data.data.user3;
                    }

                    setBetRoom([...betRoom]);
                }
                return;
            }
            socket.off('joinRoom');
        });
        // return () => {};
    }, [betRoom]);

    const teamsInfo = [
        { name: events.away?.name, image: `${BASE_URL}/${events.away?.image_id}.png` },
        { name: events.home?.name, image: `${BASE_URL}/${events.home?.image_id}.png` },
        { name: 'Draw', image: DrawIcon }
    ];

    function TabPanel(props: TabPanelProps) {
        const { children, value, index, ...other } = props;

        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`vertical-tabpanel-${index}`}
                aria-labelledby={`vertical-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box sx={{ p: 3 }}>
                        <Typography>{children}</Typography>
                    </Box>
                )}
            </div>
        );
    }

    const CreateContent = () => (
        <>
            <Formik
                initialValues={{
                    amount: '',
                    winner: '',
                    submit: null
                }}
                validationSchema={Yup.object().shape({
                    amount: Yup.number()
                        .min(0.01)
                        .max(balance)
                        .required(formatMessage({ id: 'Amount is required' })),
                    winner: Yup.number()
                        .min(0)
                        .max(2)
                        .required(formatMessage({ id: 'Choose the team to win' }))
                })}
                onSubmit={handleCreate}
            >
                {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                    <form noValidate onSubmit={handleSubmit}>
                        <DialogTitle
                            sx={{
                                '@media (max-width:400px)': {
                                    padding: 0
                                }
                            }}
                        >
                            Pick Winner
                        </DialogTitle>
                        <DialogContent
                            sx={{
                                '@media (max-width:400px)': {
                                    padding: 0
                                }
                            }}
                        >
                            <Grid
                                sx={{
                                    background: '#081b3f',
                                    borderRadius: '18px',
                                    userSelect: 'none'
                                }}
                                p={2}
                            >
                                <Grid container justifyContent="space-between">
                                    <Grid
                                        item
                                        xs={tabSelect ? 6 : 4}
                                        sm={tabSelect ? 6 : 4}
                                        display="flex"
                                        justifyContent="center"
                                        alignItems="center"
                                    >
                                        <TeamName>{events.home?.name}</TeamName>
                                    </Grid>
                                    {!tabSelect && (
                                        <Grid item xs={4} sm={4} display="flex" justifyContent="center" alignItems="center">
                                            <TeamName>Draw</TeamName>
                                        </Grid>
                                    )}
                                    <Grid
                                        item
                                        xs={tabSelect ? 6 : 4}
                                        sm={tabSelect ? 6 : 4}
                                        display="flex"
                                        justifyContent="center"
                                        alignItems="center"
                                    >
                                        <TeamName>{events.away?.name}</TeamName>
                                    </Grid>
                                </Grid>
                                <Grid container justifyContent="space-between">
                                    <Grid
                                        item
                                        xs={tabSelect ? 6 : 4}
                                        sm={tabSelect ? 6 : 4}
                                        display="flex"
                                        justifyContent="center"
                                        alignItems="center"
                                    >
                                        <TeamAvatar
                                            // onClick={eventssHandler}
                                            sx={{
                                                '@media (max-width:490px)': {
                                                    width: 70,
                                                    height: 70
                                                },
                                                '@media (max-width:350px)': {
                                                    width: 50,
                                                    height: 50
                                                }
                                            }}
                                            alt={events.home?.name}
                                            src={`${BASE_URL}/${events.home?.image_id}.png`}
                                        />
                                    </Grid>
                                    {!tabSelect && (
                                        <Grid item xs={4} sm={4} display="flex" justifyContent="center" alignItems="center">
                                            <DrawTeamAvatar
                                                sx={{
                                                    WebkitBoxShadow: '0px -1px 8px 5px rgb(187 98 98 / 16%)',
                                                    width: 100,
                                                    height: 100,
                                                    bgcolor: 'white',
                                                    borderRadius: '50%',
                                                    mt: '10px',
                                                    '@media (max-width:490px)': {
                                                        width: 70,
                                                        height: 70
                                                    },
                                                    '@media (max-width:350px)': {
                                                        width: 50,
                                                        height: 50
                                                    }
                                                }}
                                            />
                                        </Grid>
                                    )}
                                    <Grid
                                        item
                                        xs={tabSelect ? 6 : 4}
                                        sm={tabSelect ? 6 : 4}
                                        display="flex"
                                        justifyContent="center"
                                        alignItems="center"
                                    >
                                        <TeamAvatar
                                            // onClick={eventssHandler}
                                            sx={{
                                                '@media (max-width:490px)': {
                                                    width: 70,
                                                    height: 70
                                                },
                                                '@media (max-width:350px)': {
                                                    width: 50,
                                                    height: 50
                                                }
                                            }}
                                            alt={events.away?.name}
                                            src={`${BASE_URL}/${events.away?.image_id}.png`}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container justifyContent="space-between">
                                    <CreateBet />
                                </Grid>
                            </Grid>
                            <FormControl sx={{ m: 1, width: '25ch' }} error={Boolean(touched.amount && errors.amount)} variant="filled">
                                <InputLabel htmlFor="filled-adornment-amount">
                                    <FormattedMessage id="Amount" />
                                </InputLabel>
                                <OutlinedInput
                                    autoFocus
                                    type="number"
                                    id="filled-adornment-amount"
                                    value={values.amount}
                                    name="amount"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    label={formatMessage({ id: 'Amount' })}
                                    endAdornment={<InputAdornment position="end">{currency.symbol}</InputAdornment>}
                                    aria-describedby="filled-weight-helper-text"
                                    inputProps={{}}
                                />
                                {touched.amount && errors.amount && (
                                    <FormHelperText error id="filled-adornment-amount">
                                        {errors.amount}
                                    </FormHelperText>
                                )}
                            </FormControl>

                            <FormControl error={Boolean(touched.winner && errors.winner)}>
                                <RadioGroup
                                    row
                                    name="winner"
                                    id="filled-adornment-winner"
                                    value={values.winner}
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                >
                                    <FormControlLabel value="1" control={<Radio />} label={events.home?.name} labelPlacement="top" />
                                    {!tabSelect && <FormControlLabel value="2" control={<Radio />} label="Draw" labelPlacement="top" />}
                                    <FormControlLabel value="0" control={<Radio />} label={events.away?.name} labelPlacement="top" />
                                </RadioGroup>
                                {touched.winner && errors.winner && (
                                    <FormHelperText error id="filled-adornment-winner">
                                        {errors.winner}
                                    </FormHelperText>
                                )}
                            </FormControl>
                            {errors.submit && (
                                <Box sx={{ mt: 3 }}>
                                    <FormHelperText error>{errors.submit}</FormHelperText>
                                </Box>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button disabled={isSubmitting} type="submit" sx={{ border: '1px solid' }}>
                                {isSubmitting && <CircularProgress size={20} sx={{ mr: 1 }} />}
                                <FormattedMessage id="Create" />
                            </Button>
                        </DialogActions>
                    </form>
                )}
            </Formik>
        </>
    );

    const MarketOneItem = (props: any) => {
        const { update, item, index, winner } = props;
        let state = false;
        let bgd = '#ffa800';
        let bgd_hover = '#2196f3';
        if (item.user1?.id === userId || item.user2?.id === userId || item.user3?.id === userId) {
            state = true;
            bgd = '#00000';
            bgd_hover = '#00000';
        }
        return (
            <Box
                bgcolor="#ffffff2e"
                borderRadius="5px"
                sx={{
                    webkitBoxShadow: '0px 10px 13px -7px #000000, 5px 5px 15px 5px rgb(0 0 0 / 0%)'
                }}
                color="white"
            >
                <OddWarraper
                    gridColumn="span 4"
                    update={update}
                    sx={{
                        justifyContent: 'center',
                        padding: '5px 8%',
                        background: item[index].id ? '' : bgd,
                        '&:hover': {
                            background: item[index].id ? '' : bgd_hover
                        }
                    }}
                    onClick={() => {
                        if (!state && !item[index].id) handleJoin(item.id, winner, item[index].balance, item.currency.id);
                    }}
                >
                    <Typography
                        className="odd-num"
                        overflow="hidden"
                        sx={{
                            color: item[index].id ? '' : 'black !important'
                        }}
                        textOverflow="ellipsis"
                    >
                        {!isMobile && (item[index].id ? item[index].username : 'Join Game')}
                        {isMobile && (item[index].id ? item[index].username : 'Join')}
                    </Typography>
                </OddWarraper>
                <Stack flexDirection="column" sx={{ opacity: item[index].id ? 1 : 0.5 }}>
                    <Grid container p={1}>
                        <Grid item xs={12} sm={6} m="auto" textAlign="center" color="#b9b9b9">
                            Amount Bet:
                        </Grid>
                        <Grid item xs={12} sm={6} m="auto" textAlign="center">
                            {item[index].balance.toString().slice(0, 7)} {isMobile && <br />}
                            <span style={{ fontSize: '10px' }}>{item.currency.symbol}</span>
                        </Grid>
                    </Grid>
                    <Grid container p={1}>
                        <Grid item xs={12} sm={6} m="auto" textAlign="center" color="#b9b9b9">
                            Amount to Win:
                        </Grid>
                        <Grid item xs={12} sm={6} m="auto" color="#00ff37" textAlign="center">
                            {Number((item[index].balance * item[index].odds).toFixed(5))
                                .toString()
                                .slice(0, 7)}{' '}
                            {isMobile && <br />}
                            <span style={{ fontSize: '10px', color: 'white' }}>{item.currency.symbol}</span>
                        </Grid>
                    </Grid>
                </Stack>
            </Box>
        );
    };

    const MarketOne = (props: any) => {
        const { item } = props;
        if (marketOne && marketOne.home_od !== '-' && marketOne.draw_od) {
            return (
                <>
                    <Grid item xs={4} sm={4} p={isMobile ? '1%' : '3%'}>
                        <MarketOneItem item={item} winner={1} index="user1" update={marketOne?.update1} oddnum={marketOne.home_od} />
                    </Grid>
                    {!item.bet2 && (
                        <Grid item xs={4} sm={4} p={isMobile ? '1%' : '3%'}>
                            <MarketOneItem item={item} winner={2} index="user2" update={marketOne?.update3} oddnum={marketOne.draw_od} />
                        </Grid>
                    )}
                    <Grid item xs={4} sm={4} p={isMobile ? '1%' : '3%'}>
                        <MarketOneItem item={item} winner={0} index="user3" update={marketOne?.update2} oddnum={marketOne.home_od} />
                    </Grid>
                </>
            );
        }
        if (marketOne && marketOne.home_od !== '-' && !marketOne.draw_od) {
            return (
                <>
                    <Grid item xs={6} sm={6}>
                        <MarketOneItem item={item} winner={1} index="user1" update={marketOne?.update1} oddnum={marketOne.home_od} />
                    </Grid>
                    <Grid item xs={6} sm={6}>
                        <MarketOneItem item={item} winner={0} index="user3" update={marketOne?.update2} oddnum={marketOne.home_od} />
                    </Grid>
                </>
            );
        }
        return <Lock />;
    };

    const CreateBetItem = (props: any) => {
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
            </Box>
        );
    };

    const CreateBet = () => {
        if (marketOne && marketOne.home_od !== '-' && marketOne.draw_od) {
            if (tabSelect === 0) {
                return (
                    <>
                        <Grid item xs={4} sm={4} p="1%">
                            <CreateBetItem update={marketOne?.update1} oddnum={marketOne.home_od} />
                        </Grid>
                        <Grid item xs={4} sm={4} p="1%">
                            <CreateBetItem update={marketOne?.update3} oddnum={marketOne.draw_od} />
                        </Grid>
                        <Grid item xs={4} sm={4} p="1%">
                            <CreateBetItem update={marketOne?.update2} oddnum={marketOne.away_od} />
                        </Grid>
                    </>
                );
            }
            if (tabSelect === 1) {
                const home_od = Number(((Number(marketOne.home_od) + Number(marketOne.away_od)) / Number(marketOne.away_od)).toFixed(3));
                const away_od = Number(((Number(marketOne.home_od) + Number(marketOne.away_od)) / Number(marketOne.home_od)).toFixed(3));
                return (
                    <>
                        <Grid item xs={6} sm={6} p="1%">
                            <CreateBetItem update={marketOne?.update1} oddnum={home_od} />
                        </Grid>
                        <Grid item xs={6} sm={6} p="1%">
                            <CreateBetItem update={marketOne?.update2} oddnum={away_od} />
                        </Grid>
                    </>
                );
            }
        }
        if (marketOne && marketOne.home_od !== '-' && !marketOne.draw_od) {
            return (
                <>
                    <Grid item xs={6} sm={6}>
                        <CreateBetItem update={marketOne?.update1} oddnum={marketOne.home_od} />
                    </Grid>
                    <Grid item xs={6} sm={6}>
                        <CreateBetItem update={marketOne?.update2} oddnum={marketOne.away_od} />
                    </Grid>
                </>
            );
        }
        return <Lock />;
    };

    const DrawTeamAvatar = (props: any) => {
        const { sx } = props;
        return (
            <Box sx={sx}>
                <Stack flexDirection="row" mt="23%">
                    <TeamAvatar
                        sx={{
                            WebkitBoxShadow: '0px -1px 8px 5px rgb(187 98 98 / 16%)',
                            width: '50%',
                            height: '50%',
                            border: '1px solid black',
                            margin: 0,
                            '@media (max-width:380px)': {
                                width: 35,
                                height: 35
                            }
                        }}
                        alt={events.home?.name}
                        src={`${BASE_URL}/${events.home?.image_id}.png`}
                    />
                    <TeamAvatar
                        // onClick={eventssHandler}
                        sx={{
                            WebkitBoxShadow: '0px -1px 8px 5px rgb(187 98 98 / 16%)',
                            width: '50%',
                            height: '50%',
                            border: '1px solid black',
                            margin: 0,
                            '@media (max-width:380px)': {
                                width: 35,
                                height: 35
                            }
                        }}
                        alt={events.away?.name}
                        src={`${BASE_URL}/${events.away?.image_id}.png`}
                    />
                </Stack>
            </Box>
        );
    };

    const handleOpenModal = () => {
        if (!isLoggedIn) snackbar('Please login in to site!', 'error');
        else if (balance === 0) snackbar('Please deposit it in your wallet!', 'error');
        else {
            setModalOpen(true);
        }
    };

    const backHandler = () => {
        let name = 'sports';

        const prevPath = location.state as any;
        if (prevPath?.prevPath !== undefined) {
            name = prevPath.prevPath.split('/')[1];
        }
        navigate(`/${name}/${activeSports?.SportId}`);
    };

    function a11yTabProps(index: number) {
        return {
            id: `vertical-tab-${index}`,
            'aria-controls': `vertical-tabpanel-${index}`
        };
    }

    const handleTabChange = (event: SyntheticEvent, newValue: number) => {
        setTabSelect(newValue);
    };

    const handleCreate = async (values: { amount: string; winner: string }, { setErrors, setStatus, setSubmitting }: any) => {
        setPageLoading(true);
        let bet2: boolean = false;
        if (tabSelect) {
            bet2 = true;
        }
        Axios.post('api/v2/worldcup/create-bet', {
            id: params.id,
            token,
            amount: values.amount,
            winner: values.winner,
            bet2
        })
            .then(({ data }) => {
                if (!data.state) {
                    console.log(data, '===>result');
                } else {
                    setEvents(data.event);
                    const market = formatData(data.event);
                    setMarkets(market);
                }
                setPageLoading(false);
            })
            .catch(() => {
                setPageLoading(false);
            });
        setModalOpen(false);
    };

    const handleJoin = async (roomId: string, winner: number, balances: number, currencyId: string) => {
        if (!isLoggedIn) snackbar('Please login in to site!', 'error');
        else if (balance === 0) snackbar('Please deposit it in your wallet!', 'error');
        else if (currency._id !== currencyId) {
            snackbar('Your token and game token do not match.', 'error');
        } else if (balance < Number(balances || 0)) {
            snackbar('Your amount is less than the game amount.', 'error');
        } else {
            setPageLoading(true);
            Axios.post('api/v2/worldcup/join-bet', { id: params.id, token, roomId, winner })
                .then(({ data }) => {
                    if (!data.state) {
                        console.log(data, '===>result');
                    } else {
                        setEvents(data.event);
                        const market = formatData(data.event);
                        setMarkets(market);
                    }
                    setPageLoading(false);
                })
                .catch(() => {
                    setPageLoading(false);
                });
            setModalOpen(false);
        }
    };

    if (loading) return <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '18px', boxShadow }} />;
    if (!markets.length) return <Typography>Events are currently not available</Typography>;
    if (pageLoading) return <Loader />;
    return (
        <>
            {/* <Transitions in direction="up" type="slide"> */}
            <EventBreadcrumbs theme={theme}>
                <Stack className="text-wrapper">
                    <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={3}>
                        <Box gridColumn="span 3">
                            <Stack spacing={1} alignItems="center">
                                <Avatar
                                    src={`${BASE_URL}/${events.home?.image_id}.png`}
                                    alt={events.home?.name}
                                    sx={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: 0,
                                        background: 'transparent',
                                        fontSize: '4rem',
                                        color: '#fff'
                                    }}
                                />
                                <Typography className="team-name">{events.home?.name}</Typography>
                            </Stack>
                        </Box>
                        <Box
                            gridColumn="span 6"
                            sx={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                display: 'flex'
                            }}
                        >
                            <Stack spacing={1}>
                                <Typography className="h6" textAlign="center" color="peru">
                                    Start Time
                                </Typography>
                                <Typography color="#fff" variant="h2" textAlign="center" fontSize="2rem">
                                    {moment(events.time * 1000).format('hh:mm')}
                                </Typography>
                                <Typography color="#fff" variant="h2" textAlign="center">
                                    {moment(events.time * 1000).format('YYYY.MM.DD')}
                                </Typography>
                                <Typography color="#fff" variant="h2" textAlign="center">
                                    <Button
                                        variant="contained"
                                        sx={{
                                            '&:hover': {
                                                background: '#2196f3'
                                            },
                                            display: isLoggedIn ? 'block' : 'none'
                                        }}
                                        onClick={handleOpenModal}
                                    >
                                        Create Game
                                    </Button>
                                </Typography>
                            </Stack>
                        </Box>
                        <Box gridColumn="span 3">
                            <Stack spacing={1} alignItems="center">
                                <Avatar
                                    src={`${BASE_URL}/${events.away?.image_id}.png`}
                                    alt={events.away?.name}
                                    sx={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: 0,
                                        background: 'transparent',
                                        fontSize: '4rem',
                                        color: '#fff'
                                    }}
                                />
                                <Typography className="team-name">{events.away?.name}</Typography>
                            </Stack>
                        </Box>
                    </Box>
                </Stack>
                <img className="background" src={`${BASE_URL}/${activeSports?.img}`} alt="" />
            </EventBreadcrumbs>
            <Breadcrumbs
                aria-label="breadcrumb"
                sx={{
                    background: '#212637',
                    borderRadius: 1,
                    mb: 1,
                    p: 2,
                    boxShadow
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <Link
                        color="inherit"
                        underline="hover"
                        sx={{ display: 'flex', cursor: 'pointer', alignItems: 'center' }}
                        onClick={() => navigate(-1)}
                    >
                        <KeyboardArrowLeftIcon />
                    </Link>
                    <Link
                        color="inherit"
                        underline="hover"
                        sx={{ display: 'flex', cursor: 'pointer', alignItems: 'center' }}
                        onClick={backHandler}
                    >
                        {/* {activeSports?.SportName && <FormattedMessage id={activeSports.SportName} />} */}
                        Football
                    </Link>
                </Stack>
                <Typography sx={{ display: 'flex', alignItems: 'center' }} color="text.primary">
                    {`${events.home?.name} - ${events.away?.name}`}
                </Typography>
            </Breadcrumbs>
            <br />
            <Grid container spacing={2} ml="-9px">
                {betRoom.map((row: any, index: number) => (
                    <Grid item xs={12} sm={6} p={1} key={index}>
                        <Box
                            sx={{
                                background: '#081b3f',
                                borderRadius: '18px'
                            }}
                        >
                            <br />

                            <Grid container justifyContent="center">
                                <Grid
                                    item
                                    xs={4}
                                    sm={4}
                                    ml={row.bet2 ? 3 : 0}
                                    display="flex"
                                    justifyContent="center"
                                    flexDirection="column"
                                    alignItems="center"
                                    position="relative"
                                >
                                    {row.user1.id && (
                                        <Tooltip arrow title={teamsInfo[row.user1.winner]?.name}>
                                            <SmallTeamAvatar
                                                // onClick={eventsHandler}
                                                sx={{ top: 0, left: !row.bet2 ? '20%' : '28%' }}
                                                alt={teamsInfo[row.user1.winner]?.name}
                                                src={teamsInfo[row.user1.winner]?.image}
                                            />
                                        </Tooltip>
                                    )}
                                    <TeamAvatar
                                        // onClick={eventssHandler}
                                        sx={{
                                            WebkitBoxShadow: '0px -1px 8px 5px rgb(187 98 98 / 16%)',
                                            opacity: row.user1.id ? 1 : 0.3
                                        }}
                                        alt={row.user1.id ? row.user1.username : events.home?.name}
                                        src={row.user1.id ? `${BASE_URL}/${row.user1.avatar}` : `${BASE_URL}/${events.home?.image_id}.png`}
                                    />
                                    <Typography mt="5px" color="white" sx={{ opacity: row.user1.id ? 1 : 0.3 }}>
                                        X {Number(row.user1.odds)}
                                    </Typography>
                                </Grid>

                                {!row.bet2 && (
                                    <Grid
                                        item
                                        xs={4}
                                        sm={4}
                                        display="flex"
                                        fontSize="45px"
                                        color="white"
                                        justifyContent="center"
                                        alignItems="center"
                                        position="relative"
                                        flexDirection="column"
                                    >
                                        {row.user2.id && (
                                            <>
                                                <Tooltip arrow title={teamsInfo[row.user2.winner]?.name}>
                                                    <DrawTeamAvatar
                                                        sx={{
                                                            width: 45,
                                                            height: 45,
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: '20%',
                                                            bgcolor: 'white',
                                                            borderRadius: '50%',
                                                            border: '3px solid #3F4357',
                                                            zIndex: 3,
                                                            '@media (max-width:380px)': {
                                                                width: 20,
                                                                height: 20
                                                            }
                                                        }}
                                                    />
                                                </Tooltip>
                                                <TeamAvatar
                                                    // onClick={eventssHandler}
                                                    sx={{ WebkitBoxShadow: '0px -1px 8px 5px rgb(187 98 98 / 16%)' }}
                                                    alt={row.user2.id ? row.user2.username : 'draw'}
                                                    src={`${BASE_URL}/${row.user2.avatar}`}
                                                />
                                            </>
                                        )}
                                        {!row.user2.id && (
                                            <DrawTeamAvatar
                                                sx={{
                                                    WebkitBoxShadow: '0px -1px 8px 5px rgb(187 98 98 / 16%)',
                                                    width: 100,
                                                    height: 100,
                                                    bgcolor: 'white',
                                                    borderRadius: '50%',
                                                    opacity: row.user2.id ? 1 : 0.3,
                                                    mt: '10px',
                                                    '@media (max-width:380px)': {
                                                        width: 70,
                                                        height: 70
                                                    }
                                                }}
                                            />
                                        )}
                                        <Typography mt="5px" color="white" sx={{ opacity: row.user2.id ? 1 : 0.3 }}>
                                            X {Number(row.user2.odds)}
                                        </Typography>
                                    </Grid>
                                )}

                                <Grid
                                    item
                                    xs={4}
                                    sm={4}
                                    mr={row.bet2 ? 3 : 0}
                                    display="flex"
                                    justifyContent="center"
                                    position="relative"
                                    flexDirection="column"
                                    alignItems="center"
                                >
                                    {row.user3.id && (
                                        <Tooltip arrow title={teamsInfo[row.user3.winner]?.name}>
                                            <SmallTeamAvatar
                                                // onClick={eventsHandler}
                                                sx={{ top: 0, left: !row.bet2 ? '20%' : '28%' }}
                                                alt={teamsInfo[row.user3.winner]?.name}
                                                src={teamsInfo[row.user3.winner]?.image}
                                            />
                                        </Tooltip>
                                    )}
                                    <TeamAvatar
                                        // onClick={eventssHandler}
                                        sx={{ WebkitBoxShadow: '0px -1px 8px 5px rgb(187 98 98 / 16%)', opacity: row.user3.id ? 1 : 0.3 }}
                                        alt={row.user3.id ? row.user3.username : events.away?.name}
                                        src={row.user3.id ? `${BASE_URL}/${row.user3.avatar}` : `${BASE_URL}/${events.away?.image_id}.png`}
                                    />
                                    <Typography mt="5px" color="white" sx={{ opacity: row.user3.id ? 1 : 0.3 }}>
                                        X {Number(row.user3.odds)}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Grid container justifyContent="center">
                                <MarketOne item={row} />
                            </Grid>
                        </Box>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
                <Box sx={{ width: '100%' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={tabSelect} onChange={handleTabChange} aria-label="basic tabs example">
                            <Tab label="Add Draw" {...a11yTabProps(0)} />
                            <Tab label="Remove Draw" {...a11yTabProps(1)} />
                        </Tabs>
                    </Box>
                    <TabPanel value={tabSelect} index={0}>
                        <CreateContent />
                    </TabPanel>
                    <TabPanel value={tabSelect} index={1}>
                        <CreateContent />
                    </TabPanel>
                </Box>
            </Dialog>
            {/*  </Transitions> */}
        </>
    );
};

export default BetsPage;
