import { Grid, Link, Stack, Typography } from '@mui/material';
import LogoSection from './MainLayout/LogoSection';
import TelIcon from 'assets/images/contact/telegram.png';
import TwIcon from 'assets/images/contact/twitter.png';
import GoIcon from 'assets/images/contact/google.png';

const Footer = () => (
    <Grid
        container
        p={4}
        sx={{
            '@media (max-width:767px)': {
                marginBottom: '70px'
            }
        }}
    >
        <Grid
            item
            sm={6}
            md={8}
            sx={{
                width: '50%',
                '@media (max-width:425px)': {
                    width: '100%',
                    justifyContent: 'center',
                    display: 'flex'
                }
            }}
            justifyContent="center"
        >
            <LogoSection />
        </Grid>
        <Grid
            item
            sm={6}
            md={4}
            sx={{
                width: '50%',
                '@media (max-width:425px)': {
                    width: '100%'
                }
            }}
            justifyContent="center"
        >
            <Typography
                variant="h5"
                sx={{
                    textAlign: 'center',
                    '@media (max-width:767px) and (min-width:426px)': {
                        textAlign: 'right'
                    }
                }}
                mb={1.5}
            >
                <p style={{ color: '#0cb3ff' }}>CONTACT WITH US</p>
                {/* <FormattedMessage id="CONTACT WITH US" /> */}
            </Typography>
            <Stack
                direction="row"
                sx={{
                    justifyContent: 'center',
                    '@media (max-width:767px) and (min-width:426px)': {
                        justifyContent: 'right'
                    }
                }}
                spacing={2}
            >
                {/* <Link href="https://discord.gg/NCjZKTeW6J" target="_blank">
                        <IconBrandDiscord size={30} />
                    </Link> */}
                <Link href=" https://twitter.com/wcierc20" target="_blank">
                    <img src={TwIcon} alt="twitter" style={{ width: '30px', height: '30px' }} />
                    {/* <IconBrandTwitter size={30} /> */}
                </Link>
                <Link href="https://t.me/WorldCupInuOfficial" target="_blank">
                    <img src={TelIcon} alt="telegram" style={{ width: '30px', height: '30px' }} />
                    {/* <IconBrandTelegram size={30} /> */}
                </Link>
                {/* <Link href="https://www.instagram.com/mbsportsbook/" target="_blank"> */}
                {/* <IconBrandInstagram size={30} /> */}
                {/* <img src={GoIcon} style={{ width: '30px', height: '30px' }} /> */}
                {/* </Link> */}
                <Link href="mailto:wcierc20@gmail.com" target="_blank">
                    {/* <IconBrandInstagram size={30} /> */}
                    <img src={GoIcon} alt="gmail" style={{ width: '30px', height: '30px' }} />
                </Link>
            </Stack>
            {/* <Typography variant="h5" mt={3}>
                                <FormattedMessage id="Accepted currencies" />
                            </Typography> */}
            {/* <Stack sx={{ display: 'flex', mt: 1.5, flexWrap: 'wrap', gap: 2 }} direction="row">
                                {currencies.map((item, key) => (
                                    <Link key={key} href={item.officialLink} target="_blank">
                                        <img style={{ width: '30px', height: '30px' }} src={item.icon} alt={item.name} />
                                    </Link>
                                ))}
                            </Stack> */}
        </Grid>
    </Grid>
);

export default Footer;
