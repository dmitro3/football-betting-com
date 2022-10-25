import { Avatar, Badge, BadgeProps, Box, Grid, styled, Tab, Tabs, Theme, Typography } from '@mui/material';
import config from 'config';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { SportsLockIcon } from './SvgIcon';
import headerBackground from 'assets/images/landing/header-bg.jpg';
import MainCard, { MainCardProps } from './cards/MainCard';

interface MainStyleProps {
    theme: Theme;
    open: boolean;
    dWidth: number;
}

export const LoaderWrapper = styled('div')({
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 1301,
    width: '100%'
});

export const AuthCardWrapper = ({ children, ...other }: MainCardProps) => (
    <MainCard
        sx={{
            maxWidth: { xs: 400, lg: 475 },
            margin: { xs: 2.5, md: 3 },
            '& > *': {
                flexGrow: 1,
                flexBasis: '50%'
            }
        }}
        content={false}
        {...other}
    >
        <Box sx={{ p: { xs: 2, sm: 3, xl: 5 } }}>{children}</Box>
    </MainCard>
);

export const AuthWrapper = styled('div')(({ theme }) => ({
    background: `${theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.primary.light}80`,
    height: '100vh',
    width: '100vw',
    position: 'fixed',
    top: 0,
    left: 0,
    overflow: 'auto',
    zIndex: 1300,
    backdropFilter: 'blur(5px)'
}));

export const HeaderWrapper = styled('div')(({ theme }) => ({
    backgroundImage: `url(${headerBackground})`,
    backgroundSize: '100% 600px',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
    textAlign: 'center',
    paddingTop: 30,
    width: '100%',
    [theme.breakpoints.down('md')]: {
        paddingTop: 0
    }
}));

export const Main = styled('main', {
    shouldForwardProp: (prop) => prop !== 'open' && prop !== 'theme' && prop !== 'dWidth'
})(({ theme, open, dWidth }: MainStyleProps) => ({
    ...theme.typography.mainContent,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    width: `calc(100% - ${dWidth}px)`
}));

export const SidebarItem = styled('div', {
    shouldForwardProp: (prop) => prop !== 'index'
})(({ index }: { index: number }) => ({
    width: '40px',
    height: '40px',
    minWidth: '40px',
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '14px',
    ...(index === 0 && {
        background:
            'linear-gradient(86.01deg, #3d05c3 -12.52%, #7940a5 110.73%), linear-gradient(228.67deg, #3984FF 5.65%, #5F93FF 100%), #D9D9D9',
        boxShadow: '4px 2px 15px -4px #4500eb'
    }),
    ...(index === 1 && {
        background: 'linear-gradient(228.67deg, #9a1131 5.65%, #d95977 100%), #D9D9D9',
        boxShadow: '4px 2px 15px -4px #b51a3e'
    }),
    ...(index === 2 && {
        background: 'linear-gradient(228.67deg, #ffa800 5.65%, #b78017 100%), #D9D9D9',
        boxShadow: '4px 2px 15px -4px #ffa800'
    }),
    ...(index === 3 && {
        background: 'linear-gradient(228.67deg, #D8354B 5.65%, #E65D3D 100%), #D9D9D9',
        boxShadow: '4px 2px 15px -4px #D8354B'
    }),
    ...(index === 4 && {
        background: 'linear-gradient(228.67deg, #87C260 5.65%, #F7CA45 100%), #D9D9D9',
        boxShadow: '4px 2px 15px -4px #87C260'
    })
}));

export const SportsItem = styled('div', {
    shouldForwardProp: (prop) => prop !== 'theme' && prop !== 'active'
})(({ theme, index, active }: { theme: Theme; index: number; active: boolean }) => ({
    width: '70px',
    marginBottom: '1rem  !important',
    '& .warraper': {
        cursor: 'pointer',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        width: '60px',
        minWidth: '60px',
        height: '60px',
        marginLeft: '5px',
        overflow: 'hidden',
        borderRadius: '17px',
        ':active': {
            border: '2px solid rgba(255, 255, 255, 0.7)',
            '& .cover': {
                transform: 'scale(.5)',
                '& .back': {
                    width: '100%',
                    height: '100%',
                    opacity: '0.5'
                }
            }
        },
        ...(active && {
            border: '2px solid rgba(255, 255, 255, 0.7)',
            '& .cover .back': {
                width: '100%  !important',
                height: '100%  !important',
                opacity: '0.5'
            }
        }),
        ...(index === 0 && {
            background: 'linear-gradient(86.01deg, #5426C2 -12.52%, #AA62E2 110.73%)',
            boxShadow: '3px 3px 15px -5px #5426C2'
        }),
        ...(index === 1 && {
            background:
                'linear-gradient(228.67deg, #3984FF 5.65%, #5F93FF 100%), linear-gradient(86.01deg, #5426C2 -12.52%, #AA62E2 110.73%), linear-gradient(228.67deg, #D8354B 5.65%, #E65D3D 100%), #D9D9D9',
            boxShadow: '3px 3px 15px -5px #3984FF'
        }),
        ...(index === 2 && {
            background:
                'linear-gradient(228.67deg, #7CD044 5.65%, #6AB739 100%), linear-gradient(86.01deg, #5426C2 -12.52%, #AA62E2 110.73%), linear-gradient(228.67deg, #D8354B 5.65%, #E65D3D 100%), #D9D9D9',
            boxShadow: '3px 3px 15px -5px #7CD044'
        }),
        ...(index === 3 && {
            background:
                'linear-gradient(228.67deg, #D8354B 5.65%, #E65D3D 100%), linear-gradient(86.01deg, #5426C2 -12.52%, #AA62E2 110.73%), linear-gradient(228.67deg, #D8354B 5.65%, #E65D3D 100%), #D9D9D9',
            boxShadow: '3px 3px 15px -5px #D8354B'
        }),
        ...(index === 4 && {
            background:
                'linear-gradient(228.67deg, #87C260 5.65%, #F7CA45 100%), linear-gradient(86.01deg, #5426C2 -12.52%, #AA62E2 110.73%), linear-gradient(228.67deg, #D8354B 5.65%, #E65D3D 100%), #D9D9D9',
            boxShadow: '3px 3px 15px -5px #87C260'
        }),
        '& .cover': {
            position: 'relative',
            width: '100%',
            height: '100%',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '& .back': {
                width: 0,
                height: 0,
                background: 'white',
                transition: 'all 0.3s',
                borderRadius: '15px'
            },
            '& i': {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'white',
                fontSize: '28px'
            }
        }
    },
    '& p': {
        marginTop: '0.4rem',
        width: '70px',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'inherit'
    }
}));

export const Breadcrumbs = styled('div', {
    shouldForwardProp: (prop) => prop !== 'theme'
})(({ theme, background }: { theme: Theme; background: string | undefined }) => ({
    marginTop: '0.5rem',
    borderRadius: '18px',
    padding: '33px 34px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.1s',
    backgroundColor: '#181D2D',
    boxShadow: config.boxShadow,
    '& .text-box': {
        position: 'relative',
        zIndex: 2
    },
    '& .background': {
        position: 'absolute',
        width: '100%',
        right: '0px',
        top: '50%',
        zIndex: 1,
        transform: 'translateY(-50%)',
        opacity: 0.4
    },
    '& .trophy': {
        transform: 'rotate(24deg)',
        position: 'absolute',
        width: '200px',
        right: '15vw',
        top: '-30px',
        opacity: 0.7,
        zIndex: 1
    },
    '& h3': {
        fontWeight: '700',
        fontSize: '38px',
        lineHeight: '100%',
        color: 'white',
        marginBottom: '0.5rem'
    },
    '& .MuiTypography-body1': {
        fontWeight: '400',
        fontSize: '14px',
        lineHeight: '100%',
        opacity: 0.5,
        color: 'white'
    },
    '& .MuiTypography-body2': {
        fontWeight: '400',
        fontSize: '14px',
        lineHeight: '100%',
        color: 'white'
    },
    '& .light-1': {
        position: 'absolute',
        width: '156px',
        height: '156px',
        right: '10px',
        top: 0,
        background: '#330a4d',
        opacity: '0.5',
        filter: 'blur(100px)'
    },
    '& .light-2': {
        position: 'absolute',
        width: '488px',
        height: '488px',
        right: '0px',
        top: '-160px',
        background: '#330a4d',
        filter: 'blur(100px)'
    },
    '& .light-3': {
        background: 'linear-gradient(86.01deg, #5426C2 -12.52%, #AA62E2 110.73%), #D9D9D9',
        boxShadow: '0px 4px 20px rgba(170, 98, 226, 0.45)',
        borderRadius: '10px',
        position: 'absolute',
        width: '10px',
        height: '10px',
        right: '5vw',
        zIndex: 11,
        bottom: '30px'
    },
    '& .light-4': {
        background: 'linear-gradient(86.01deg, #5426C2 -12.52%, #AA62E2 110.73%), #D9D9D9',
        boxShadow: '0px 4px 20px rgba(170, 98, 226, 0.45)',
        borderRadius: '10px',
        position: 'absolute',
        width: '10px',
        height: '10px',
        right: '20vw',
        zIndex: 11,
        bottom: '50px'
    },
    '& .light-5': {
        background: 'linear-gradient(86.01deg, #5426C2 -12.52%, #AA62E2 110.73%), #D9D9D9',
        boxShadow: '0px 4px 20px rgba(170, 98, 226, 0.45)',
        borderRadius: '10px',
        position: 'absolute',
        width: '10px',
        height: '10px',
        right: '10vw',
        zIndex: 11,
        top: '30px'
    },
    [theme.breakpoints.down('md')]: {
        padding: '20px 34px',
        '& .background': {
            minHeight: '100px'
        },
        '& .trophy': {
            width: '100px',
            right: '15vw',
            top: 0
        }
    }
}));

export const EventBreadcrumbs = styled('div', {
    shouldForwardProp: (prop) => prop !== 'theme'
})(({ theme }: { theme: Theme }) => ({
    display: 'flex',
    marginTop: '0.5rem',
    marginBottom: '1rem',
    borderRadius: '18px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.1s',
    backgroundColor: '#181D2D',
    minHeight: '170px',
    boxShadow: config.boxShadow,
    '& .css-nen11g-MuiStack-root': {
        position: 'relative',
        zIndex: 2
    },
    '& .background': {
        position: 'relative',
        width: '100%',
        right: '0px',
        zIndex: 1,
        opacity: 0.7
    },
    '& .text-wrapper': {
        position: 'absolute',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        zIndex: 12
    },
    '& .team-name': {
        marginTop: '10px',
        fontWeight: '500',
        lineHeight: '100%',
        fontSize: '15px',
        color: 'white',
        textAlign: 'center'
    },
    '& .light-1': {
        position: 'absolute',
        width: '156px',
        height: '156px',
        right: '10px',
        top: 0,
        background: '#330a4d',
        opacity: '0.5',
        filter: 'blur(100px)'
    },
    '& .light-2': {
        position: 'absolute',
        width: '488px',
        height: '488px',
        right: '0px',
        top: '-160px',
        background: '#330a4d',
        filter: 'blur(100px)'
    },
    '& .light-3': {
        position: 'absolute',
        width: '488px',
        height: '488px',
        left: '0px',
        top: '-160px',
        background: '#330a4d',
        filter: 'blur(100px)'
    },
    [theme.breakpoints.down('md')]: {
        '& .background': {
            minHeight: '100px'
        }
    }
}));

export const TeamName = styled(Typography)({
    display: 'block',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: '14px',
    lineHeight: '100%',
    color: '#fff',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    width: '75%',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    '@media (max-width: 900px)': {
        width: '100px'
    }
});

export const TeamAvatar = styled(Avatar)({
    p: 0.5,
    marginTop: '10px',
    border: '3px solid #3F4357',
    background: '#fff',
    cursor: 'pointer',
    width: 100,
    height: 100,
    '@media (max-width:380px)': {
        width: 70,
        height: 70
    }
});

export const SmallTeamAvatar = styled(Avatar)({
    p: 0.5,
    border: '3px solid #3F4357',
    background: '#fff',
    cursor: 'pointer',
    position: 'absolute',
    zIndex: 2,
    width: 45,
    height: 45,
    '@media (max-width:350px)': {
        width: 35,
        height: 35
    }
});

export const OddWarraper = ({
    children,
    gridColumn,
    update,
    onClick,
    active,
    sx
}: {
    children: ReactNode;
    gridColumn: string;
    update: string | undefined;
    onClick?: any;
    active?: boolean;
    sx?: any;
}) => (
    <Box gridColumn={gridColumn}>
        <Box
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <Box
                onClick={onClick}
                className={`arrow-${update}`}
                sx={{
                    background: '#3F4357',
                    borderRadius: '3px',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: '2rem',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '5px 20px',
                    transition: 'transform 0.1s',
                    boxShadow: config.boxShadow,
                    '&:hover': {
                        background: '#2196f309',
                        '& path': {
                            fill: '#fff'
                        },
                        '& .odd-num': {
                            color: '#fff'
                        },
                        '& .odd-attr': {
                            color: '#fff'
                        }
                    },
                    '& svg': {
                        width: '20px'
                    },
                    '&:active': {
                        transform: 'scale(0.95)'
                    },
                    '& .odd-attr': {
                        fontWeight: '700',
                        fontSize: '12px',
                        lineHeight: '100%',
                        color: '#76C841',
                        mr: 0.5
                    },
                    '& .odd-num': {
                        fontWeight: '700',
                        fontSize: '14px',
                        lineHeight: '100%',
                        color: '#fff'
                    },
                    ...(active && {
                        background: '#2196f3',
                        '& path': {
                            fill: '#fff'
                        },
                        '& .odd-num': {
                            fontWeight: '700',
                            fontSize: '12px',
                            lineHeight: '100%',
                            color: '#fff',
                            mr: 0.5
                        },
                        '& .odd-attr': {
                            fontWeight: '700',
                            fontSize: '12px',
                            lineHeight: '100%',
                            color: '#fff',
                            mr: 0.5
                        }
                    }),
                    ...sx
                }}
            >
                {children}
            </Box>
        </Box>
    </Box>
);

export const Lock = () => (
    <>
        <Grid item sm={6} xs={6} p={2}>
            <OddWarraper gridColumn="span 6" update={undefined} sx={{ justifyContent: 'center' }}>
                <SportsLockIcon />
            </OddWarraper>
        </Grid>
        <Grid item sm={6} xs={6} p={2}>
            <OddWarraper gridColumn="span 6" update={undefined} sx={{ justifyContent: 'center' }}>
                <SportsLockIcon />
            </OddWarraper>
        </Grid>
    </>
);

export const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
    '& .MuiBadge-badge': {
        right: -13,
        top: 10
    }
}));

export const StatusBadge = ({ status }: { status: string }) => (
    <>
        {status === 'BET' && (
            <Badge
                color="primary"
                sx={{
                    '& .MuiBadge-badge': {
                        position: 'relative',
                        transform: 'unset',
                        textTransform: 'capitalize'
                    }
                }}
                badgeContent={<FormattedMessage id="Active" />}
            />
        )}
        {status === 'bet2' && (
            <Badge
                color="primary"
                sx={{
                    '& .MuiBadge-badge': {
                        position: 'relative',
                        transform: 'unset',
                        textTransform: 'capitalize'
                    }
                }}
                badgeContent={<FormattedMessage id="Remove Draw" />}
            />
        )}
        {status === 'WIN' && (
            <Badge
                color="success"
                sx={{
                    '& .MuiBadge-badge': {
                        position: 'relative',
                        transform: 'unset',
                        textTransform: 'capitalize',
                        color: '#fff'
                    }
                }}
                badgeContent={<FormattedMessage id="Won" />}
            />
        )}
        {status === 'LOST' && (
            <Badge
                color="error"
                sx={{
                    '& .MuiBadge-badge': {
                        position: 'relative',
                        transform: 'unset',
                        textTransform: 'capitalize',
                        color: '#fff'
                    }
                }}
                badgeContent={<FormattedMessage id="Lose" />}
            />
        )}
        {status === 'HALF_WIN' && (
            <>
                <Badge
                    color="success"
                    sx={{
                        '& .MuiBadge-badge': {
                            position: 'relative',
                            transform: 'unset',
                            textTransform: 'capitalize',
                            color: '#fff'
                        }
                    }}
                    badgeContent={<FormattedMessage id="Won" />}
                />
                <Badge
                    color="warning"
                    sx={{
                        '& .MuiBadge-badge': {
                            position: 'relative',
                            transform: 'unset',
                            textTransform: 'capitalize',
                            color: '#fff',
                            background: '#8492c4'
                        }
                    }}
                    badgeContent={<FormattedMessage id="Void" />}
                />
            </>
        )}
        {status === 'HALF_LOST' && (
            <>
                <Badge
                    color="error"
                    sx={{
                        '& .MuiBadge-badge': {
                            position: 'relative',
                            transform: 'unset',
                            textTransform: 'capitalize',
                            color: '#fff'
                        }
                    }}
                    badgeContent={<FormattedMessage id="Lose" />}
                />
                <Badge
                    color="warning"
                    sx={{
                        '& .MuiBadge-badge': {
                            position: 'relative',
                            transform: 'unset',
                            textTransform: 'capitalize',
                            color: '#fff',
                            background: '#8492c4'
                        }
                    }}
                    badgeContent={<FormattedMessage id="Void" />}
                />
            </>
        )}
        {status === 'REFUND' && (
            <Badge
                color="warning"
                sx={{
                    '& .MuiBadge-badge': {
                        position: 'relative',
                        transform: 'unset',
                        textTransform: 'capitalize',
                        color: '#fff',
                        background: '#8492c4'
                    }
                }}
                badgeContent={<FormattedMessage id="Refund" />}
            />
        )}
        {status === 'CANCEL' && (
            <Badge
                color="warning"
                sx={{
                    '& .MuiBadge-badge': {
                        position: 'relative',
                        transform: 'unset',
                        textTransform: 'capitalize',
                        color: '#fff',
                        background: '#8492c4'
                    }
                }}
                badgeContent={<FormattedMessage id="Cancel" />}
            />
        )}
        {status === 'SETTLED' && (
            <Badge
                color="warning"
                sx={{
                    '& .MuiBadge-badge': {
                        position: 'relative',
                        transform: 'unset',
                        textTransform: 'capitalize',
                        color: '#fff',
                        background: '#8492c4'
                    }
                }}
                badgeContent={<FormattedMessage id="Settled" />}
            />
        )}
    </>
);

export const WTabs = styled(Tabs)({
    marginTop: '8px',
    marginBottom: '8px',
    minHeight: '45px',
    display: 'inline-flex',
    border: 'none',
    '& .MuiTabs-flexContainer': {
        boxShadow: config.boxShadow,
        border: 'none',
        background: '#212946',
        borderRadius: '100px',
        padding: '6px',
        overflow: 'hidden'
    },
    '& .MuiTabs-indicator': {
        display: 'none',
        height: 0
    }
});

export const WTab = styled(Tab)({
    minHeight: '40px',
    color: '#fff',
    opacity: 0.5,
    '&.Mui-selected': {
        boxShadow: config.boxShadow,
        background: '#29314f',
        borderRadius: '100px',
        overflow: 'hidden',
        color: '#fff',
        opacity: 1
    }
});
