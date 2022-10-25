import { ConfigProps } from 'types/config';

export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:2002';
export const BASE_PATH = '';
export const HOME_PATH = '/';

const config: ConfigProps = {
    fontFamily: `'Roboto', sans-serif`,
    borderRadius: 8,
    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 3px 0px, rgba(0, 0, 0, 0.12) 0px 1px 2px 0px, rgba(255, 255, 255, 0.04) 0px 1px 0px 0px inset',
    outlinedFilled: true,
    navType: 'light',
    presetColor: 'default',
    locale: 'en',
    rtlLayout: false,
    timer1: 5000,
    timer2: 900000,
    RECAPTCHA_SITE_KEY: '6Le40T8iAAAAAOGU2LbwnuRigp5FkgMT0NZQ8-OM'
};

export default config;
