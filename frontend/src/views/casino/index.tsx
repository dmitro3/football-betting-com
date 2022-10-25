import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Card, Skeleton, Stack, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import Axios from 'utils/axios';
import { BASE_URL } from 'config';
import useConfig from 'hooks/useConfig';

import Transitions from 'ui-component/extended/Transitions';

interface CasinoList {
    _id: string;
    providerId: string;
    id: string;
    name: string;
    img: string;
    icon: string;
    overlay: string;
    type: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
}

const CasinoPage = () => {
    const { boxShadow } = useConfig();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [gameList, setGameList] = useState<CasinoList[]>([]);

    useEffect(() => {
        setLoading(true);
        Axios.post('api/v2/games/list', {})
            .then(({ data }: { data: CasinoList[] }) => {
                // const slotsData = {
                //     _id: '6266288659e0ba7ac4ee4a60',
                //     providerId: '',
                //     id: 'slots',
                //     name: 'Slots',
                //     img: '1650862909178.svg',
                //     icon: "<svg class='casino-icon' viewBox='0 0 32 32'>     <path fill='currentColor'         d='M28.16 23.904l-4.256 4.256h-15.807l-4.256-4.256v-15.808l4.256-4.255h15.808l4.256 4.255v15.809zM26.4 0h-20.801l-5.599 5.599v20.801l5.599 5.6h20.801l5.6-5.6v-20.801l-5.6-5.599z     M15.355 16.922c0.135 0 0.229 0.027 0.283 0.080s0.080 0.148 0.080 0.283v0.459c0 0.135-0.025 0.229-0.074 0.282s-0.146 0.080-0.288 0.080h-0.736v1.398c0 0.135-0.027 0.229-0.080 0.282s-0.148 0.080-0.283 0.080h-0.522c-0.135 0-0.229-0.027-0.283-0.080s-0.080-0.148-0.080-0.282v-1.398h-3.52c-0.135 0-0.229-0.027-0.283-0.080s-0.080-0.148-0.080-0.282v-0.384c0-0.177 0.043-0.323 0.128-0.437l3.541-4.394c0.142-0.171 0.313-0.256 0.512-0.256h0.587c0.135 0 0.229 0.025 0.283 0.075s0.080 0.146 0.080 0.287v4.288zM13.371 14.064l-2.315 2.858h2.315zM16.539 14.704c0-0.789 0.249-1.415 0.747-1.877s1.191-0.693 2.080-0.693c0.889 0 1.58 0.231 2.075 0.693s0.741 1.088 0.741 1.877v2.741c0 0.797-0.247 1.426-0.741 1.888s-1.186 0.693-2.075 0.693c-0.889 0-1.582-0.231-2.080-0.693s-0.747-1.092-0.747-1.888zM20.848 14.704c0-0.42-0.13-0.745-0.389-0.976s-0.624-0.347-1.093-0.347c-0.469 0-0.834 0.116-1.093 0.347s-0.389 0.556-0.389 0.976v2.741c0 0.42 0.13 0.747 0.389 0.981s0.624 0.352 1.093 0.352c0.469 0 0.834-0.117 1.093-0.352s0.389-0.562 0.389-0.981zM22.067 6.667h-12.134l-3.267 3.266v12.134l3.266 3.266h12.134l3.266-3.266v-12.134l-3.266-3.266z' /> </svg>",
                //     overlay: '1650862915280.svg',
                //     type: 'skill',
                //     status: true,
                //     createdAt: '2022-04-25T04:51:49.026Z',
                //     updatedAt: '2022-05-27T02:03:00.661Z'
                // };
                // data.push(slotsData);
                setGameList(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    if (loading) return <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '18px', boxShadow }} />;

    return (
        <Card
            sx={{
                p: { xs: 0, sm: 3 },
                borderRadius: '18px',
                background: '#181D2D',
                boxShadow
            }}
        >
            <Transitions in direction="up" type="slide">
                <Stack direction="row" flexWrap="wrap" justifyContent="center">
                    {gameList.map((item, key) => (
                        <Box
                            key={key}
                            sx={{
                                m: 1,
                                boxShadow: 'rgba(27, 23, 23, 0.2) 0px 4px 6px -1px, rgba(0, 0, 0, 0.12) 0px 2px 4px -1px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                flexDirection: 'column',
                                width: '140px',
                                height: '190px',
                                position: 'relative',
                                backdropFilter: 'blur(20px)',
                                transition: 'all .5s ease',
                                zIndex: 1,
                                borderRadius: '8px',
                                overflow: 'hidden',
                                ':hover': {
                                    zIndex: 5,
                                    transform: 'translateY(-10px)',
                                    '& .cover': {
                                        opacity: 1
                                    },
                                    '& .image': {
                                        filter: 'blur(3px)'
                                    }
                                },
                                '@media (max-width:767px)': {
                                    m: 0.2,
                                    width: '90px',
                                    height: '125px'
                                }
                            }}
                            onClick={() => navigate(`/casino/${item.id}`)}
                        >
                            <Box
                                className="image"
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    position: 'relative',
                                    transition: 'all .4s ease',
                                    zIndex: 5,
                                    ':before': {
                                        backgroundImage: `url(${BASE_URL}/${item.overlay})`,
                                        opacity: 0.8,
                                        zIndex: 2,
                                        left: 0
                                    },
                                    ':after': {
                                        backgroundImage: `url(${BASE_URL}/${item.img})`
                                    },
                                    ':before, :after': {
                                        backgroundPosition: '50%',
                                        backgroundSize: 'cover',
                                        backgroundRepeat: 'no-repeat',
                                        content: '""',
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        top: 0
                                    }
                                }}
                            />
                            <Box
                                sx={{
                                    p: 2,
                                    width: '100%',
                                    height: '100%',
                                    position: 'absolute',
                                    background: 'rgba(27, 34, 51, .8)',
                                    transition: 'all .8s ease',
                                    opacity: 0,
                                    zIndex: 6
                                }}
                                className="cover"
                            >
                                <Typography
                                    sx={{
                                        textAlign: 'center',
                                        color: '#fff',
                                        fontSize: '18px',
                                        fontWeight: 500
                                    }}
                                >
                                    {item.name}
                                </Typography>
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        p: 1,
                                        borderRadius: 10,
                                        background: '#ed1d49',
                                        display: 'flex'
                                    }}
                                >
                                    <PlayArrowIcon
                                        sx={{
                                            width: '2.5rem',
                                            height: '2.5rem',
                                            color: '#fff'
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Stack>
            </Transitions>
        </Card>
    );
};

export default CasinoPage;
