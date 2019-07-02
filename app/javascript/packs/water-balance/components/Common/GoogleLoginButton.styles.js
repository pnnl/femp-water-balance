import DarkButtonNormal from 'images/btn_google_signin_dark_normal_web.png';
import DarkButtonPressed from 'images/btn_google_signin_dark_pressed_web.png';
import DarkButtonFocus from 'images/btn_google_signin_dark_focus_web.png';
import DarkButtonDisabled from 'images/btn_google_signin_dark_disabled_web.png';

import LightButtonNormal from 'images/btn_google_signin_light_normal_web.png';
import LightButtonPressed from 'images/btn_google_signin_light_pressed_web.png';
import LightButtonFocus from 'images/btn_google_signin_light_focus_web.png';
import LightButtonDisabled from 'images/btn_google_signin_light_disabled_web.png';

const GoogleLoginButtonStyles = {
    buttonRoot: {
        width: '382px',
        height: '92px',
    },
    darkButton: {
        background: `url(${DarkButtonNormal})`,
        "&:hover":{
            background: `url(${DarkButtonFocus})`,
        },
        "&:disabled":{
            background: `url(${DarkButtonDisabled})`,
        },
        "&:active":{
            background: `url(${DarkButtonPressed})`,
        },
    },
    lightButton: {
        background: `url(${LightButtonNormal})`,
        "&:hover":{
            background: `url(${LightButtonFocus})`,
        },
        "&:disabled":{
            background: `url(${LightButtonDisabled})`,
        },
        "&:active":{
            background: `url(${LightButtonPressed})`,
        },
    },
};
export default GoogleLoginButtonStyles;
