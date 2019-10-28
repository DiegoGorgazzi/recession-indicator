import React, {Fragment} from 'react';

import Auxi from "../../../hoc/Auxi/Auxi";

import classes from './NavigationItems.module.css';
import NavigationItem from './NavigationItem/NavigationItem';

const navigationItems = ( props ) => (
    <ul className={classes.NavigationItems}>
        <NavigationItem link="/" exact>Home</NavigationItem>
        {!props.isAuthenticated
            ? <Fragment>
                <NavigationItem link="/stock-options">Stock Options</NavigationItem>
                <NavigationItem link="/auth">Sign Up</NavigationItem>
              </Fragment>
            : <Auxi>
                 <NavigationItem link="/stock-options">Stock Options</NavigationItem>
                 <NavigationItem link="/logout">Logout</NavigationItem>
                </Auxi>}
    </ul>
);

export default navigationItems;