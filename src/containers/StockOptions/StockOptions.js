import React, { Component } from "react";
import { connect } from "react-redux";

import PleaseSignUp from "../../components/UI/PleaseSignUp/PleaseSignUp";
import classes from "./StockOptions.module.css";

class StockOptions extends Component {
  state = {isSignup: true};


  render() {
  

    return (
    <div className={classes.container}>
         {!this.props.isAuthenticated ? (
            <PleaseSignUp />
          ) : (
            <h5>Coming Soon...</h5>
          )}
    </div>
    )
};
}

const mapStateToProps = state => {
  return {
    isAuthenticated: state.auth.token !== null,
  };
};


export default connect(
  mapStateToProps,
  null
)(StockOptions);
