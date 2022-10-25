import { useCallback, useEffect, useState, SyntheticEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Box, Card, CircularProgress, Grid, useMediaQuery, Stack, Typography, Button, TextField, Tabs, Tab } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EventIcon from '@mui/icons-material/Event';
import moment from 'moment';

import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';

import { FormattedMessage } from 'react-intl';
// import PerfectScrollbar from 'react-perfect-scrollbar';

import config from 'config';
import { inintSportsData, SportsListProps, SportsMatchProps, SportsParamsProps, TabProps } from 'types/sports';

import Axios from 'utils/axios';
import { checkUpdate } from 'utils/sports';

import Loader from 'ui-component/Loader';
// import { SportsItem, Breadcrumbs } from 'ui-component';
import Transitions from 'ui-component/extended/Transitions';
import { FutureIcon, InplaysIcon, NexthoursIcon } from 'ui-component/SvgIcon';
import Event from './component/Event';
// import Trophy from 'assets/images/sports/trophy.png';
// import Slide from 'assets/images/sports/slide.png';
import Logo from 'assets/images/logo/logo.png';
import Banner from 'assets/images/logo/banner.png';

const tabs = [
    {
        index: 0,
        title: 'In-plays',
        status: 'LIVE',
        icon: <InplaysIcon />
    },
    {
        index: 1,
        title: 'Next 1 hour',
        status: 'HOUR',
        icon: <NexthoursIcon />
    },
    {
        index: 2,
        title: 'Next 24hrs',
        status: 'TODAY',
        icon: <NexthoursIcon />
    },
    {
        index: 3,
        title: 'Future',
        status: 'PRE',
        icon: <FutureIcon />
    }
];

const SportsPage = () => {
    const params: SportsParamsProps = useParams();
    const navigate = useNavigate();

    const isMobile = useMediaQuery('(max-width:767px)');
    // const isDesktop = useMediaQuery('(min-width:1440px)');

    const [activeSports, setActiveSports] = useState<number>(Number(params?.sportsId) || 0);
    // const [activeTab, setActiveTab] = useState<TabProps | undefined>(tabs[params.tabId || 1]);
    const [activeTab, setActiveTab] = useState<TabProps | undefined>(tabs[3]);
    const [activeSportsData, setActiveSportsData] = useState<SportsListProps>(inintSportsData);
    const [sportsLists, setSportsLists] = useState<SportsListProps[]>([]);
    const [sportsMatchs, setSportsMatchs] = useState<SportsMatchProps[]>([]);
    const [activeLeague, setActiveLeague] = useState<number[]>([]);
    const [pageLoading, setPageLoading] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadNum, setLoadNum] = useState<number>(8);
    const [searchTeam, setSearchTeam] = useState<String>('');
    const [searchDate, setSearchDate] = useState<Dayjs | null>(dayjs(''));
    const [sportsData, setSportsData] = useState<SportsMatchProps[]>([]);

    const [tabSelected, setTabSelected] = useState<number>(Number(sessionStorage.getItem('tabSelectedLeague')) || 0);

    const tabHandleChange = (event: SyntheticEvent, newValue: string) => {
        sessionStorage.setItem('tabSelectedLeague', newValue);
        setTabSelected(Number(newValue));
    };

    const updateMatchs = useCallback(checkUpdate, [sportsMatchs, activeSports]);

    const initActiveSport = (data: SportsListProps[]) => {
        if (!activeSports) {
            setActiveSports(data[0].SportId);
            setActiveSportsData(data[0]);
            // navigate(`/sports/${data[0].SportId}/${activeTab?.index || 0}`, { replace: true });
            navigate(`/${data[0].SportId}/${activeTab?.index || 0}`, { replace: true });
        } else {
            setActiveSportsData(data.find((e) => e.SportId === activeSports) || inintSportsData);
        }
    };

    const activeLeagueHandler = (LeagueId: number) => {
        const isOpen = activeLeague.indexOf(LeagueId) > -1;
        if (isOpen) {
            setActiveLeague(activeLeague.filter((id: number) => id !== LeagueId));
        } else {
            setActiveLeague([...activeLeague, LeagueId]);
        }
    };

    const getSportsList = () => {
        setPageLoading(true);
        Axios.post('api/v1/sports/lists', {})
            .then(({ data }: { data: SportsListProps[] }) => {
                setSportsLists(data);
                setPageLoading(false);
                initActiveSport(data);
            })
            .catch(() => {
                setPageLoading(false);
            });
    };

    const handleChange = (newValue: Dayjs | null) => {
        setSearchDate(newValue);
    };

    const getSportMatchs = () => {
        setLoading(true);
        Axios.post('api/v1/sports/matchs', {
            SportId: activeSports,
            EventStatus: activeTab?.status
        })
            .then(({ data }) => {
                updateMatchs(data, sportsMatchs, activeSports, setSportsMatchs);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const getSportsListsTimer = () => {
        Axios.post('api/v1/sports/lists', {}).then(({ data }) => {
            setSportsLists(data);
        });
    };

    const getSportMatchsTimer = useCallback(() => {
        if (!activeTab?.status) return;
        Axios.post('api/v1/sports/matchs', {
            SportId: activeSports,
            EventStatus: activeTab?.status
        }).then(({ data }) => {
            updateMatchs(data, sportsMatchs, activeSports, setSportsMatchs);
        });
    }, [activeSports, activeTab, sportsMatchs, updateMatchs]);

    useEffect(() => {
        let unmounted = false;
        if (!unmounted) {
            getSportsList();
        }
        return () => {
            unmounted = true;
        };
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        let unmounted = false;
        if (!unmounted) {
            getSportMatchs();
        }
        return () => {
            unmounted = true;
        };
        // eslint-disable-next-line
    }, [activeSports, activeTab]);

    useEffect(() => {
        let unmounted = false;
        const timer = setInterval(() => {
            if (!unmounted) {
                getSportMatchsTimer();
                getSportsListsTimer();
            }
        }, config.timer1);
        return () => {
            clearInterval(timer);
            unmounted = true;
        };
    }, [getSportMatchsTimer]);

    useEffect(() => {
        // console.log(sportsMatchs, 'sportsMatchs');
    }, [sportsMatchs]);

    useEffect(() => {
        if (tabSelected === 0) {
            const data = sportsMatchs.filter((row) => row.LeagueId === 94); // EPL sports
            setSportsData(data);
        } else if (tabSelected === 1) {
            const data = sportsMatchs.filter((row) => row.LeagueId === 1040); // UEFA Bets
            setSportsData(data);
        } else if (tabSelected === 2) {
            const data = sportsMatchs.filter((row) => row.LeagueId === 1067); // UEFA Europa Bets
            setSportsData(data);
        } else if (tabSelected === 3) {
            const data = sportsMatchs.filter((row) => row.LeagueId === 29334); // world cup
            setSportsData(data);
        }
    }, [tabSelected, sportsMatchs]);

    const timeFormat = (val: number) =>
        moment(val * 1000)
            .toDate()
            .toString()
            .slice(0, 15);

    const renderMatchs = () => {
        if (loading) {
            return (
                <Stack alignItems="center" justifyContent="center">
                    <CircularProgress color="inherit" />
                </Stack>
            );
        }
        if (!sportsMatchs.length) {
            return (
                <Typography
                    sx={{
                        textAlign: 'center',
                        fontWeight: '700',
                        fontSize: '16px',
                        lineHeight: '100%',
                        color: '#fff'
                    }}
                >
                    <FormattedMessage id="Events are currently not available" />
                </Typography>
            );
        }
        const item = sportsData[0];
        // return sportsMatchs.map((item, key) => {
        // const events = item.events.filter(
        //     (e) =>
        //         e.home.name.toLowerCase().indexOf(search.toLowerCase()) !== -1 ||
        //         e.away.name.toLowerCase().indexOf(search.toLowerCase()) !== -1
        // );
        if (!item) return <Typography sx={{ color: 'black' }}>There are currently no matches expected</Typography>;

        const events = !searchDate?.valueOf()
            ? item.events.filter(
                  (e) =>
                      e.home.name.toLowerCase().indexOf(searchTeam.toLowerCase()) !== -1 ||
                      e.away.name.toLowerCase().indexOf(searchTeam.toLowerCase()) !== -1
              )
            : item.events.filter(
                  (e) =>
                      (e.home.name.toLowerCase().indexOf(searchTeam.toLowerCase()) !== -1 ||
                          e.away.name.toLowerCase().indexOf(searchTeam.toLowerCase()) !== -1) &&
                      timeFormat(e.time) === searchDate?.toDate().toString().slice(0, 15)
              );

        //
        // if (!events.length) return <Fragment key={key} />;
        return (
            <>
                {/* <Stack>
                        
                    </Stack> */}
                <Card
                    sx={{
                        background: '#081b3f',
                        borderRadius: '13px',
                        py: 2,
                        px: { xs: 1, sm: 2 },
                        boxShadow: '0 10px 16px 0 rgb(0 0 0 / 90%), 0 6px 20px 0 rgb(0 0 0 / 30%)'
                    }}
                >
                    <Stack
                        onClick={() => activeLeagueHandler(item.LeagueId)}
                        pl={1}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                            overflow: 'hidden',
                            borderRadius: 1,
                            cursor: 'pointer',
                            padding: 3
                        }}
                    >
                        <Typography variant="h3" className="text">
                            {item.LeagueId === 29334 && `FIFA`} {item.LeagueName.replace('England', 'English')}
                        </Typography>
                        <Stack direction="row" alignItems="center">
                            <Badge
                                badgeContent={item.events?.length || 0}
                                color="secondary"
                                sx={{
                                    mr: 3,
                                    '& .MuiBadge-badge': {
                                        background: 'linear-gradient(228.67deg, #7CD044 5.65%, #6AB739 100%), #D9D9D9'
                                    }
                                }}
                            />
                            {/* <IconButton size="small">
                                    {activeLeague.indexOf(item.LeagueId) !== -1 ? <KeyboardArrowDownIcon /> : <KeyboardArrowLeftIcon />}
                                </IconButton> */}
                        </Stack>
                    </Stack>
                    <Stack flexDirection={!isMobile ? 'row' : 'column'}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                width: !isMobile ? '50%' : '90%',
                                margin: !isMobile ? 5 : 2.5,
                                border: '1px solid #a7a711',
                                borderRadius: '15px',
                                padding: '0 15px 15px 15px'
                            }}
                        >
                            <SearchIcon sx={{ color: 'white', mr: 1, my: 0.5 }} />
                            <TextField
                                id="input-with-sx"
                                label="Search by Team"
                                sx={{
                                    width: '100%',
                                    '& input': {
                                        color: 'white',
                                        fontSize: '20px'
                                    },
                                    '& label': {
                                        fontSize: '20px'
                                    }
                                }}
                                value={searchTeam}
                                variant="standard"
                                onChange={(e) => {
                                    setSearchTeam(e.target.value);
                                }}
                            />
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                width: !isMobile ? '50%' : '90%',
                                margin: !isMobile ? 5 : 2.5,
                                border: '1px solid #a7a711',
                                borderRadius: '15px',
                                padding: '15px'
                            }}
                        >
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <EventIcon sx={{ color: 'white', mr: 1, my: 0.5 }} />
                                <Stack
                                    spacing={3}
                                    sx={{
                                        width: '99%',
                                        '& div': {
                                            bgcolor: '#0000'
                                        },
                                        '& div input': {
                                            bgcolor: '#0000',
                                            color: 'white',
                                            fontSize: '20px',
                                            padding: '4px 0 5px'
                                        },
                                        '& label': {
                                            fontSize: '20px',
                                            color: '#9e9e9e !important',
                                            mt: '-12px',
                                            ml: !isMobile ? '0' : '-4%'
                                        },
                                        '& div fieldset': {
                                            border: '0px',
                                            borderBottom: '1px solid rgba(0, 0, 0, 0.42) !important',
                                            borderRadius: '0px'
                                        }
                                    }}
                                >
                                    <MobileDatePicker
                                        label="Select Date"
                                        inputFormat="MM/DD/YYYY"
                                        value={searchDate}
                                        onChange={handleChange}
                                        renderInput={(val) => <TextField {...val} />}
                                    />
                                </Stack>
                            </LocalizationProvider>
                        </Box>
                    </Stack>
                </Card>
                {/* {activeLeague.indexOf(item.LeagueId) !== -1 && ( */}
                <Transitions in direction="up" type="slide">
                    <Grid container spacing={2} ml="-9px">
                        {events.slice(0, loadNum).map((event, index) => (
                            <Grid item xs={12} sm={6} p={1} key={index}>
                                <Event event={event} activeSports={activeSportsData} isLive={activeTab?.status === 'LIVE' || false} />
                            </Grid>
                        ))}
                        {events.length > loadNum && (
                            <Stack width="100%">
                                <span
                                    style={{
                                        padding: '6px',
                                        margin: 'auto'
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        sx={{
                                            '& .front': {
                                                background: '#0e56df'
                                            }
                                        }}
                                        onClick={() => {
                                            setLoadNum(loadNum + 8);
                                        }}
                                        className="pushable"
                                    >
                                        <span className="front">Load More</span>
                                    </Button>
                                </span>
                            </Stack>
                        )}
                    </Grid>
                </Transitions>
                {/* )} */}
            </>
        );
    };

    if (pageLoading) return <Loader />;
    if (!sportsLists.length) return <Typography>Events are currently not available</Typography>;

    return (
        <Transitions in direction="up" type="slide">
            <Box className="sports-items">
                {/* <PerfectScrollbar aria-setsize={1}>
                    <Stack direction="row" spacing={2}>
                        {sportsLists.map((item, key) => (
                            <SportsItem
                                key={key}
                                index={key % 5}
                                theme={theme}
                                active={activeSports === item.SportId}
                                onClick={() => activeSportsHandler(item.SportId)}
                            >
                                <Box className="warraper">
                                    <Box className="cover">
                                        <Box className="back" />
                                        <i className={`sportsicons sportsicon-${item.SportId}`} />
                                    </Box>
                                </Box>
                                <Typography>
                                    <FormattedMessage id={item.SportName} />
                                </Typography>
                            </SportsItem>
                        ))}
                    </Stack>
                </PerfectScrollbar> */}
                {/* <Breadcrumbs theme={theme} background={`${BASE_URL}/${activeSportsData?.img}`}>
                    <Stack className="text-box">
                        <Typography className="text-ellipse" variant="h3">
                            {activeSportsData?.SportName && <FormattedMessage id={activeSportsData.SportName} />}
                            FIFA world cup 2022
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Typography variant="body1">
                                <FormattedMessage id="Home" />
                            </Typography>
                            <Typography variant="body1">/</Typography>
                            <Typography variant="body2">
                                FIFA world cup 2022
                                {activeSportsData?.SportName && <FormattedMessage id={activeSportsData.SportName} />}
                            </Typography>
                        </Stack>
                    </Stack>
                    <img className="background" src={Slide} alt="" />
                    <img className="background" src={`${BASE_URL}/${activeSportsData?.img}`} alt="" />
                    <img className="trophy" src={Trophy} alt="" />
                    <Box className="light-1" />
                    <Box className="light-2" />
                    <Box className="light-3" />
                    <Box className="light-4" />
                    <Box className="light-5" />
                </Breadcrumbs> */}
            </Box>
            {/* <Tabs
                value={activeTab?.index || 0}
                onChange={tabChangeHandler}
                aria-label="icon"
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                    ml: 2,
                    mt: 1,
                    minHeight: '45px',
                    width: 'calc(100% - 32px)',
                    '& .MuiTabs-indicator': {
                        background: '#fff'
                    }
                }}
            >
                {tabs.map((item, key) => (
                    <Tab
                        key={key}
                        icon={item.icon}
                        label={formatMessage({ id: item.title })}
                        iconPosition="start"
                        sx={{
                            minHeight: '45px',
                            opacity: '0.5',
                            color: '#fff',
                            fontWeight: '600',
                            '& svg': {
                                mt: -0.2,
                                mr: 0.5
                            },
                            '&.Mui-selected': {
                                color: '#fff',
                                opacity: '1'
                            }
                        }}
                    />
                ))}
            </Tabs> */}
            <Grid container sx={{ height: isMobile ? 'auto' : 250 }}>
                <Grid item xs={isMobile ? 12 : 6} sm={isMobile ? 12 : 6} sx={{ height: '100%' }} p={isMobile ? 0 : 7}>
                    <img src={Logo} alt="logo" style={{ width: '100%', height: 'auto' }} />
                </Grid>
                <Grid
                    item
                    xs={isMobile ? 12 : 6}
                    sm={isMobile ? 12 : 6}
                    sx={{ height: '100%' }}
                    pt={isMobile ? 0 : 4}
                    pl={isMobile ? 0 : 16}
                >
                    <img src={Banner} alt="Banner" style={{ width: '100%', height: 'auto' }} />
                </Grid>
            </Grid>
            <Card
                sx={{
                    p: { xs: 1, sm: 3 },
                    borderRadius: '18px',
                    background: '#ffffff00'
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        bgcolor: '#081b3f',
                        borderRadius: '10px',
                        padding: '0.5rem',
                        boxShadow: '0 10px 16px 0 rgb(0 0 0 / 90%), 0 6px 20px 0 rgb(0 0 0 / 30%)'
                    }}
                >
                    <Tabs
                        value={tabSelected}
                        onChange={tabHandleChange}
                        sx={{
                            border: 0,

                            '& .MuiTabs-flexContainer': {
                                display: 'inline-block',
                                // borderRadius: '99px',
                                border: 0
                                // boxShadow: '0 0 1px 0 rgb(24 94 224 / 15%), 0 6px 13px 0 rgb(24 94 224 / 15%)'
                            },
                            '& .MuiTabs-scroller': {
                                position: 'unset'
                            }
                        }}
                    >
                        <Tab
                            label={isMobile ? 'EPL' : 'EPL Bets'}
                            sx={{
                                fontSize: '25px',
                                minWidth: '10%',
                                // borderRadius: '99px 0 0 99px',
                                color: 'white',
                                '&.Mui-selected': {
                                    color: '#79e6ff',
                                    background: '#0e295c'
                                },
                                '@media (max-width:498px)': {
                                    fontSize: 15
                                }
                            }}
                        />
                        <Tab
                            label={isMobile ? 'UEFA' : 'UEFA Bets'}
                            sx={{
                                fontSize: '25px',
                                color: 'white',
                                minWidth: '10%',
                                '&.Mui-selected': {
                                    color: '#79e6ff',
                                    background: '#0e295c'
                                },
                                '@media (max-width:498px)': {
                                    fontSize: 15
                                }
                            }}
                        />
                        <Tab
                            label={isMobile ? 'Europa' : 'Europa Bets'}
                            sx={{
                                fontSize: '25px',
                                color: 'white',
                                minWidth: '10%',
                                '&.Mui-selected': {
                                    color: '#79e6ff',
                                    background: '#0e295c'
                                },
                                '@media (max-width:498px)': {
                                    fontSize: 15
                                }
                            }}
                        />
                        <Tab
                            label={isMobile ? 'WorldCup' : 'WorldCup Bets'}
                            sx={{
                                fontSize: '25px',
                                // borderRadius: '0 99px 99px 0',
                                color: 'white',
                                minWidth: '10%',
                                '&.Mui-selected': {
                                    color: '#79e6ff',
                                    background: '#0e295c'
                                },
                                '@media (max-width:498px)': {
                                    fontSize: 15
                                }
                            }}
                        />
                    </Tabs>
                </Box>
                <br />
                <br />
                <Stack spacing={{ xs: 1, sm: 2 }}>{renderMatchs()}</Stack>
            </Card>
        </Transitions>
    );
};

export default SportsPage;
