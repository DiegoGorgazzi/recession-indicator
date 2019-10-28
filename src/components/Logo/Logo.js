import React from 'react';

import dollarLogo from '../../assets/images/favicon.png';
import classes from './Logo.module.css';

const logo = (props) => (
    <div className={classes.Logo} style={{height: props.height}}>
        <img src={dollarLogo} alt="Dollar Logo Blue square" />
    </div>
);

export default logo;