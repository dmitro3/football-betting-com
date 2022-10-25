import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, Box, Grid, IconButton, Skeleton, Stack } from '@mui/material';
import { useSelector } from 'store';

// import LinkIcon from '@mui/icons-material/Link';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// import CopyToClipboard from 'react-copy-to-clipboard';
// import { useIntl } from 'react-intl';

import moment from 'moment';

import { BASE_URL } from 'config';

import useApi from 'hooks/useApi';
import useConfig from 'hooks/useConfig';

// import { toNumber } from 'utils/number';

import { StatusBadge, TeamAvatar, TeamName } from 'ui-component';
// import { MultibetIcon, StatusIcon } from 'ui-component/SvgIcon';
import CheckIcon from '@mui/icons-material/Check';
import Transitions from 'ui-component/extended/Transitions';

// import OddNum from 'views/sports/component/OddNum';

const CheckIconStyle = {
    position: 'absolute',
    fontSize: '100px',
    color: '#02ff02',
    '@media (max-width:380px)': {
        fontSize: 60
    }
};

const MybetsActive = () => {
    // const { formatMessage } = useIntl();
    const { locale, boxShadow } = useConfig();
    moment.locale(locale);
    // const isMobile = useMediaQuery('(max-width:882px)');
    const Api = useApi();
    // const navigate = useNavigate();
    const [activeOdds, setActiveOdds] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [history, setHistory] = useState([]);
    const { user } = useSelector((store) => store.auth);
    const userId = user?._id;

    const getMybets = () => {
        setLoading(true);
        Api.getMybets('Active')
            .then(({ data }) => {
                setHistory(data);

                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
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

    useEffect(() => {
        getMybets();

        // eslint-disable-next-line
    }, []);

    if (loading) return <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '18px', boxShadow }} />;
    return (
        <Grid container spacing={1}>
            {history.map((item: any, key) => {
                let index = 0;
                if (item.user1Id === userId) index = 1;
                else if (item.user2Id === userId) index = 2;
                else if (item.user3Id === userId) index = 3;
                else return <></>;
                return (
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
                                                {moment(item.createdAt).format('ddd, MMM DD, h:mm A')}
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
                                <CardContent sx={{ background: '#212637', p: 1.5 }} style={{ paddingBottom: '12px', position: 'relative' }}>
                                    <Stack>
                                        <Box textAlign="center" color="#e3efa0">
                                            {item.bettings[0].league.name.replace('England', 'English')}
                                        </Box>
                                    </Stack>
                                    <Grid container justifyContent="space-between">
                                        <Grid item xs={4} sm={4} display="flex" justifyContent="center" alignItems="center">
                                            <TeamName>{item.bettings[0].home?.name}</TeamName>
                                        </Grid>

                                        <Grid item xs={4} sm={4} display="flex" justifyContent="center" alignItems="center">
                                            <TeamName>{item.bettings[0].away?.name}</TeamName>
                                        </Grid>
                                    </Grid>
                                    <Grid container justifyContent="space-between">
                                        <Grid item xs={4} sm={4} display="flex" justifyContent="center" alignItems="center">
                                            <TeamAvatar
                                                // onClick={eventsHandler}
                                                sx={{
                                                    WebkitBoxShadow: '0px -1px 8px 5px rgb(187 98 98 / 16%)',
                                                    opacity: index === 1 ? 0.3 : 1
                                                }}
                                                alt={item.bettings[0].home?.name}
                                                src={`${BASE_URL}/${item.bettings[0].home?.image_id}.png`}
                                            />
                                            {index === 1 && <CheckIcon sx={CheckIconStyle} />}
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
                                            sx={{ opacity: item.bet2 ? 0.3 : 1 }}
                                        >
                                            <Box sx={{ opacity: index === 2 ? 0.3 : 1 }}>0 - 0</Box>
                                            {index === 2 && <CheckIcon sx={CheckIconStyle} />}
                                        </Grid>
                                        <Grid item xs={4} sm={4} display="flex" justifyContent="center" alignItems="center">
                                            <TeamAvatar
                                                // onClick={eventsHandler}
                                                sx={{
                                                    WebkitBoxShadow: '0px -1px 8px 5px rgb(187 98 98 / 16%)',
                                                    opacity: index === 3 ? 0.3 : 1
                                                }}
                                                alt={item.bettings[0].away?.name}
                                                src={`${BASE_URL}/${item.bettings[0].away?.image_id}.png`}
                                            />
                                            {index === 3 && <CheckIcon sx={CheckIconStyle} />}
                                        </Grid>
                                    </Grid>
                                    {activeOdds.indexOf(item?._id || '') !== -1 && (
                                        <Transitions in direction="left" type="slide">
                                            <Stack flexDirection="column">
                                                <Grid container p={1}>
                                                    <Grid item xs={6} sm={6} m="auto" textAlign="center" color="#b9b9b9">
                                                        Amount Bet:
                                                    </Grid>
                                                    <Grid item xs={6} sm={6} m="auto" textAlign="center">
                                                        {item[`user${index}Balance`].toString().slice(0, 7)}
                                                        <span style={{ fontSize: '10px' }}>{item.currency.symbol}</span>
                                                    </Grid>
                                                </Grid>
                                                <Grid container p={1}>
                                                    <Grid item xs={6} sm={6} m="auto" textAlign="center" color="#b9b9b9">
                                                        Amount to Win:
                                                    </Grid>
                                                    <Grid item xs={6} sm={6} m="auto" color="#00ff37" textAlign="center">
                                                        {Number((item[`user${index}Balance`] * item[`user${index}Odds`]).toFixed(5))
                                                            .toString()
                                                            .slice(0, 7)}{' '}
                                                        <span style={{ fontSize: '10px', color: 'white' }}>{item.currency.symbol}</span>
                                                    </Grid>
                                                </Grid>
                                                <Grid container p={1}>
                                                    <Grid item xs={6} sm={6} m="auto" textAlign="center" color="#b9b9b9">
                                                        Game Time:
                                                    </Grid>
                                                    <Grid item xs={6} sm={6} m="auto" textAlign="center">
                                                        {moment(item.bettings[0].time * 1000).format('ddd, MMM DD, h:mm A')}
                                                    </Grid>
                                                </Grid>
                                            </Stack>
                                        </Transitions>
                                    )}
                                </CardContent>
                            </Card>
                        </Transitions>
                    </Grid>
                );
            })}
        </Grid>
    );
};

export default MybetsActive;
