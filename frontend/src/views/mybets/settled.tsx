import { useEffect, useState } from 'react';

import { Box, Card, CardContent, CardHeader, Divider, Grid, IconButton, Skeleton, Stack } from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// import CopyToClipboard from 'react-copy-to-clipboard';

import moment from 'moment';

import { BASE_URL } from 'config';
import { useSelector } from 'store';

import useApi from 'hooks/useApi';
import useConfig from 'hooks/useConfig';

import { StatusBadge, TeamAvatar, TeamName } from 'ui-component';
import Transitions from 'ui-component/extended/Transitions';

const MybetsSettled = () => {
    const { locale, boxShadow } = useConfig();
    moment.locale(locale);
    const Api = useApi();
    const [activeOdds, setActiveOdds] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [history, setHistory] = useState([]);
    const { user } = useSelector((store) => store.auth);
    const userId = user?._id;

    const getMybets = () => {
        setLoading(true);
        Api.getMybets('Settled')
            .then(({ data }) => {
                formatData(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const formatData = async (data: any) => {
        const result: any = [];
        const tmpAry: any = [];
        await data.map(async (item: any) => {
            const state = tmpAry.filter((row: number) => row === item.eventId);
            if (!state.length) {
                tmpAry.push(item.eventId);
                const temp: any = item.bettings[0];
                temp.bet2 = item.bet2;
                temp.bets = [];
                await data.map(async (item2: any) => {
                    if (temp.id === item2.eventId) {
                        let winner: string = '';
                        let status: string = '';
                        let bet_amount: string = '';
                        let recive_amount: string = '';
                        const symbol: string = item2.currency.symbol;
                        const bettime: string = moment(item.createdAt).format('ddd, MMM DD, h:mm:ss A');

                        let win: string = '';
                        let odds: string = '';
                        if (Number(temp.ss.split('-')[0]) === Number(temp.ss.split('-')[1])) win = 'draw';
                        else if (Number(temp.ss.split('-')[0]) > Number(temp.ss.split('-')[1])) win = 'home';
                        else if (Number(temp.ss.split('-')[0]) < Number(temp.ss.split('-')[1])) win = 'away';

                        if (item2.user1Id === userId) {
                            winner = temp.home.name;
                            bet_amount = item2.user1Balance;
                            odds = item2.user1Odds;
                        } else if (item2.user2Id === userId) {
                            winner = 'draw';
                            bet_amount = item2.user2Balance;
                            odds = item2.user2Odds;
                        } else if (item2.user3Id === userId) {
                            winner = temp.away.name;
                            bet_amount = item2.user3Balance;
                            odds = item2.user3Odds;
                        }
                        if (!item.bet2 && item2.user1Id && item2.user2Id && item2.user3Id) {
                            if (
                                (item2.user1Id === userId && win === 'home') ||
                                (item2.user2Id === userId && win === 'draw') ||
                                (item2.user3Id === userId && win === 'away')
                            ) {
                                status = 'won';
                                recive_amount = formatBalanceFee(bet_amount, odds).toString();
                            } else {
                                status = 'lose';
                                recive_amount = '-';
                            }
                        } else if (item.bet2 && item2.user1Id && item2.user3Id) {
                            if ((item2.user1Id === userId && win === 'home') || (item2.user3Id === userId && win === 'away')) {
                                status = 'won';
                                recive_amount = formatBalanceFee(bet_amount, odds).toString();
                            } else {
                                status = 'lose';
                                recive_amount = '-';
                            }
                        } else {
                            status = 'Bet not placed';
                            recive_amount = bet_amount;
                        }

                        if (item2.user1Id === userId) winner = temp.home.name;
                        else if (item2.user2Id === userId) winner = 'draw';
                        else if (item2.user3Id === userId) winner = temp.away.name;

                        temp.bets.push({ winner, status, bet_amount, recive_amount, symbol, bettime });
                    }
                });
                result.push(temp);
            }
        });
        setHistory(result);
    };

    const onActive = (id: string) => {
        const findIndex = activeOdds.indexOf(id);
        if (findIndex === -1) {
            setActiveOdds([...activeOdds, id]);
        } else {
            const data = [...activeOdds];
            data.splice(findIndex, 1);
            setActiveOdds([...data]);
        }
    };

    const formatBalanceFee = (balance: string, odds: string) => {
        const fee = ((Number(balance) * Number(odds) - Number(balance)) / 100) * 10;
        return Number((Number(balance) * Number(odds) - fee).toFixed(4));
    };

    useEffect(() => {
        getMybets();
        // eslint-disable-next-line
    }, []);

    if (loading) return <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '18px', boxShadow }} />;

    return (
        <Grid container spacing={1}>
            {history.map((item: any, key) => (
                <Grid key={key} item xs={12} sm={6} lg={4}>
                    <Transitions in direction="left" type="slide">
                        <Card
                            sx={{
                                mb: 1,
                                boxShadow
                            }}
                            style={{ borderRadius: '4px' }}
                        >
                            <CardHeader
                                sx={{
                                    background: '#081b3f',
                                    p: 1.5,

                                    '& .MuiCardHeader-title': {
                                        fontSize: '14px',
                                        color: 'white'
                                    },
                                    '& svg': {
                                        fontSize: '16px',
                                        color: 'white'
                                    },
                                    boxShadow
                                }}
                                title={
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            {/* {item.type === 'multi' ? (
                                                <MultibetIcon />
                                            ) : ( */}
                                            <i className="sportsicons sportsicon-1" style={{ fontSize: '20px' }} />
                                            {/* )} */}
                                            {item.bet2 && <StatusBadge status="bet2" />}
                                        </Stack>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            {moment(item.time).format('ddd, MMM DD, h:mm A')}
                                            <IconButton onClick={() => onActive(item?._id || '')} size="small">
                                                {activeOdds.indexOf(item?._id || '') !== -1 ? (
                                                    <KeyboardArrowDownIcon />
                                                ) : (
                                                    <KeyboardArrowLeftIcon />
                                                )}
                                            </IconButton>
                                        </Stack>
                                    </Stack>
                                }
                            />
                            <CardContent sx={{ background: '#212637', p: 1.5 }} style={{ paddingBottom: '12px' }}>
                                <Stack>
                                    <Box textAlign="center" color="#e3efa0">
                                        {item.league.name.replace('England', 'English')}
                                    </Box>
                                </Stack>
                                <Grid container justifyContent="space-between">
                                    <Grid item xs={4} sm={4} display="flex" justifyContent="center" alignItems="center">
                                        <TeamName>{item.home?.name}</TeamName>
                                    </Grid>

                                    <Grid item xs={4} sm={4} display="flex" justifyContent="center" alignItems="center">
                                        <TeamName>{item.away?.name}</TeamName>
                                    </Grid>
                                </Grid>
                                <Grid container justifyContent="space-between">
                                    <Grid item xs={4} sm={4} display="flex" justifyContent="center" alignItems="center">
                                        <TeamAvatar
                                            // onClick={eventsHandler}
                                            sx={{
                                                WebkitBoxShadow: '0px -1px 8px 5px rgb(187 98 98 / 16%)'
                                            }}
                                            alt={item.home?.name}
                                            src={`${BASE_URL}/${item.home?.image_id}.png`}
                                        />
                                    </Grid>
                                    <Grid
                                        item
                                        xs={4}
                                        sm={4}
                                        display="flex"
                                        fontSize="45px"
                                        color="white"
                                        justifyContent="center"
                                        alignItems="center"
                                    >
                                        <Box sx={{ opacity: item.bet2 ? 0.3 : 1 }}>{item.ss}</Box>
                                    </Grid>
                                    <Grid item xs={4} sm={4} display="flex" justifyContent="center" alignItems="center">
                                        <TeamAvatar
                                            // onClick={eventsHandler}
                                            sx={{
                                                WebkitBoxShadow: '0px -1px 8px 5px rgb(187 98 98 / 16%)'
                                            }}
                                            alt={item.away?.name}
                                            src={`${BASE_URL}/${item.away?.image_id}.png`}
                                        />
                                    </Grid>
                                </Grid>
                                {activeOdds.indexOf(item?._id || '') !== -1 && (
                                    <Transitions in direction="left" type="slide">
                                        {item.bets.map((row: any, key2: any) => (
                                            <Stack key={key2} flexDirection="column">
                                                <Divider sx={{ py: 1 }} />
                                                <Grid container>
                                                    <Grid item xs={6} sm={6} m="auto" textAlign="center" color="#b9b9b9">
                                                        Winner:
                                                    </Grid>
                                                    <Grid item xs={6} sm={6} m="auto" textAlign="center">
                                                        {row.status === 'Bet not placed' ? row.status : row.winner}
                                                        {/* <span style={{ fontSize: '10px' }}>{`(${row.status})`}</span> */}
                                                    </Grid>
                                                </Grid>
                                                <Grid container>
                                                    <Grid item xs={6} sm={6} m="auto" textAlign="center" color="#b9b9b9">
                                                        Amount Bet:
                                                    </Grid>
                                                    <Grid item xs={6} sm={6} m="auto" textAlign="center">
                                                        {row.bet_amount} &nbsp; <span style={{ fontSize: '10px' }}>{row.symbol}</span>
                                                    </Grid>
                                                </Grid>
                                                <Grid container>
                                                    <Grid item xs={6} sm={6} m="auto" textAlign="center" color="#b9b9b9">
                                                        Recive Amount:
                                                    </Grid>
                                                    <Grid item xs={6} sm={6} m="auto" color="#00ff37" textAlign="center">
                                                        {row.recive_amount}{' '}
                                                        <span style={{ fontSize: '10px', color: 'white' }}>{row.symbol}</span>
                                                    </Grid>
                                                </Grid>
                                                <Grid container>
                                                    <Grid item xs={6} sm={6} m="auto" textAlign="center" color="#b9b9b9">
                                                        Bet Time:
                                                    </Grid>
                                                    <Grid item xs={6} sm={6} m="auto" textAlign="center">
                                                        {row.bettime}
                                                    </Grid>
                                                </Grid>
                                            </Stack>
                                        ))}
                                    </Transitions>
                                )}
                            </CardContent>
                        </Card>
                    </Transitions>
                </Grid>
            ))}
        </Grid>
    );
};

export default MybetsSettled;
