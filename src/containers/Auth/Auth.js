import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";

import Input from "../../components/UI/Input/Input";
import Button from "../../components/UI/Button/Button";
import Spinner from "../../components/UI/Spinner/Spinner";
import classes from "./Auth.module.css";
import * as actions from "../../store/actions/index";
import ToggleVisibility from "../../components/ToggleVisibility/ToggleVisibility";

class Auth extends Component {
  state = {
    controls: {
      email: {
        elementType: "input",
        elementConfig: {
          type: "email",
          placeholder: "Email Address"
        },
        value: "",
        validation: {
          required: true,
          isEmail: true
        },
        valid: false,
        touched: false
      },
      password: {
        elementType: "input",
        elementConfig: {
          type: "password",
          placeholder: "Password"
        },
        value: "",
        validation: {
          required: true,
          minLength: 8
        },
        valid: false,
        touched: false
      }
    },
    verifyAccount: {
      email: {
        elementType: "input",
        elementConfig: {
          type: "email",
          placeholder: "Email Address"
        },
        value: "",
        validation: {
          required: true,
          isEmail: true
        },
        valid: false,
        touched: false
      },
      code: {
        elementType: "input",
        elementConfig: {
          type: "text",
          placeholder: "Validation Code"
        },
        value: "",
        validation: {
          required: true,
          minLength: 4
        },
        valid: false,
        touched: false
      }
    },
    isSignup: true,
    hidePasswordRequirements: true,
  };

  toggleCompVisibility = event => {
    let hideComponent = "hide" + event.target.id;
    let hideStatus = this.state[hideComponent];
    this.setState({
      [hideComponent]: !hideStatus
    });
  };

  checkValidity(value, rules) {
    let isValid = true;
    if (!rules) {
      return true;
    }

    if (rules.required) {
      isValid = value.trim() !== "" && isValid;
    }

    if (rules.minLength) {
      //so If the value.length is greater than the rules.minLength, 
      //AND isValid is still true, then set isValid as true
      //in this way, if any of these fields turns isValid to false,
      //then all the other "if" checks will be false too.
      isValid = value.length >= rules.minLength && isValid;
    }

    if (rules.maxLength) {
      isValid = value.length <= rules.maxLength && isValid;
    }

    if (rules.isEmail) {
      const pattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
      isValid = pattern.test(value) && isValid;
    }

    if (rules.isNumeric) {
      const pattern = /^\d+$/;
      isValid = pattern.test(value) && isValid;
    }

    return isValid;
  }

  inputChangedHandler = (event, controlName, stateKey) => {
    const updatedControls = {
      ...this.state[stateKey],
      [controlName]: {
        ...this.state[stateKey][controlName],
        value: event.target.value,
        valid: this.checkValidity(
          event.target.value,
          this.state[stateKey][controlName].validation
        ),
        touched: true
      }
    };
    this.setState({ [stateKey]: updatedControls });
  };

  submitHandler = event => {
    event.preventDefault();
    this.props.onAuth(
      this.state.controls.email.value,
      this.state.controls.password.value,
      this.state.isSignup
    );
  };

  onConfirmHandler = event => {
    event.preventDefault();
    this.props.onConfirmUser(
      this.state.verifyAccount.email.value,
      this.state.verifyAccount.code.value,
      this.state.isSignup
    );
  };

  signInHandler = event => {
    event.preventDefault();
    this.props.onSignIn(
      this.state.controls.email.value,
      this.state.controls.password.value,
    );
  }

  switchAuthModeHandler = () => {
    this.setState(prevState => {
      return { isSignup: !prevState.isSignup };
    });
  };

  render() {
    const formElementsArray = [];
    for (let key in this.state.controls) {
      formElementsArray.push({
        id: key,
        config: this.state.controls[key]
      });
    }

    let form = formElementsArray.map(formElement => (
      <Input
        key={formElement.id}
        elementType={formElement.config.elementType}
        elementConfig={formElement.config.elementConfig}
        value={formElement.config.value}
        invalid={!formElement.config.valid}
        shouldValidate={formElement.config.validation}
        touched={formElement.config.touched}
        changed={event => this.inputChangedHandler(event, formElement.id, "controls")}
      />
    ));

    if (this.props.loading) {
      form = <Spinner />;
    }

    let errorMessage = null;

    if (this.props.error) {
      errorMessage = <p>{this.props.error.message}</p>;
    }

    let authRedirect = null;
    if (this.props.isAuthenticated) {
      authRedirect = <Redirect to={this.props.authRedirectPath} />;
    }

    const verifyFormElementsArray = [];
    for (let key in this.state.verifyAccount) {
      verifyFormElementsArray.push({
        id: key,
        config: this.state.verifyAccount[key]
      });
    }

    let verifyForm = verifyFormElementsArray.map(formElement => (
      <Input
        key={formElement.id}
        elementType={formElement.config.elementType}
        elementConfig={formElement.config.elementConfig}
        value={formElement.config.value}
        invalid={!formElement.config.valid}
        shouldValidate={formElement.config.validation}
        touched={formElement.config.touched}
        changed={event => this.inputChangedHandler(event, formElement.id, "verifyAccount")}
      />
    ));

    return (
      <div>
        <div className={classes.Auth}>
          {authRedirect}
          <span className={classes.error}>{errorMessage}</span>
          {this.state.isSignup ? (
            <h5>Create a FREE Account</h5>
          ) : (
            <h5>Sign in to your account</h5>
          )}
          <form
            onSubmit={
              this.state.isSignup ? this.submitHandler : this.signInHandler
            }
          >
            {form}
            <div>
              {this.state.isSignup && this.state.controls.password.touched ? (
                <div style={{marginTop: 10}}>
                  <ToggleVisibility
                    whatState={this.state.hidePasswordRequirements}
                    hideID="PasswordRequirements"
                    hideOnClick={this.toggleCompVisibility}
                    showText="Show Password Requirements"
                    hideText="Hide Password Requirements"
                  />

                  {!this.state.hidePasswordRequirements && (
                    <div>
                      <div style={{textAlign: "left"}}>
                        Please note that Passwords must:
                        <ul>
                          <li>be at least 8 characters long</li>
                          <li>contain at least a lower case letter</li>
                          <li>contain at least an Upper case letter</li>   
                          <li>contain at least one number</li>
                          <li>contain at least one special character</li>  
                        </ul> 
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                ""
              )}
            </div>
            <Button btnType="Success">
              {this.state.isSignup ? "SIGN UP" : "SIGN IN"}
            </Button>
          </form>
          <Button clicked={this.switchAuthModeHandler} btnType="Danger">
            {this.state.isSignup ? (
              <span>
                Already Registered & Verified?{" "}
                <span style={{ fontWeight: 900 }}>SIGN IN</span>
              </span>
            ) : (
              <span>
                "Never Registered?{" "}
                <span style={{ fontWeight: 900 }}>SIGN UP!</span>
              </span>
            )}
          </Button>
        </div>

        {this.state.isSignup ? (
          <div className={classes.Auth}>
            <span className={classes.error}>{errorMessage}</span>
            <form onSubmit={this.onConfirmHandler}>
              <h5>Verify Your Email</h5>
              {verifyForm}
              <Button btnType="Success">VERIFY</Button>
            </form>
          </div>
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    //here we're accessing the auth property in the
    //auth reducer (look at rootReducer in index.js
    //within the src folder which then has access 
    //to the auth.js file inside reducers folder)
    //and then we access the loading, error, etc property.
    loading: state.auth.loading,
    error: state.auth.error,
    //set isAuthenticated to true IF state.auth.token is NOT null
    isAuthenticated: state.auth.token !== null,
    authRedirectPath: state.auth.authRedirectPath
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onAuth: (email, password, isSignup) =>
      dispatch(actions.auth(email, password, isSignup)),
    onConfirmUser: (email, code, isSignup) => 
      dispatch(actions.confirmUser(email, code, isSignup)),
    onSignIn: (email, password) => 
      dispatch(actions.signIn(email, password)),  
    onSetAuthRedirectPath: () => dispatch(actions.setAuthRedirectPath("/"))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Auth);
