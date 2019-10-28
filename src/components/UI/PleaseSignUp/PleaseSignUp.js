import React from 'react';
import NavigationItem from "../../Navigation/NavigationItems/NavigationItem/NavigationItem";

import classes from './PleaseSignUp.module.css';

const pleaseSignUp = (props) => (
    <div className={classes.PleaseSignUp}>
        <h5> Please <NavigationItem link="/auth">Sign Up</NavigationItem> to access this page </h5>
    </div>
);

export default pleaseSignUp;