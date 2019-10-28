import * as actionTypes from "./actionTypes";

import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails
} from 'amazon-cognito-identity-js';

const POOL_DATA = {
  UserPoolId: "[USE YOUR OWN AWS CREDENTIAL]",
  ClientId: "[USE YOUR OWN AWS CREDENTIAL]"
};

const userPool = new CognitoUserPool(POOL_DATA);

//Action creator
export const authStart = () => {
  return {
    type: actionTypes.AUTH_START
  };
};

//Action creator
export const authSuccess = (token) => {
  return {
    type: actionTypes.AUTH_SUCCESS,
    userSession: token
  };
};

//Action creator
export const authConfirmed = (token) => {
  return {
    type: actionTypes.AUTH_CONFIRMED,
    userSession: token
  };
};

//Action creator
export const authSignIn = (token) => {
  return {
    type: actionTypes.AUTH_SIGNIN,
    userSession: token
  };
};

//Action creator
export const authFail = error => {
  return {
    type: actionTypes.AUTH_FAIL,
    error: error
  };
};

//Action creator
export const logout = () => {
  const getAuthenticatedUser = userPool.getCurrentUser();
  if(getAuthenticatedUser !==null) {
    getAuthenticatedUser.signOut();
  }
  return {
    type: actionTypes.AUTH_LOGOUT
  };
};

export const checkAuthTimeout = (howManySeconds) => {
  return dispatch => {
    setTimeout(
      () => {dispatch(logout());
        alert("Sorry, you've been Logged out")}, 
        howManySeconds * 1000);  
  };
};

export const authStateValid = (token, userId) => {
  return {
    type: actionTypes.AUTH_STATE_VALID,
    idToken: token,
    userId: userId
  };
};

//Action creator dispatching sync or async actions (some of our actions are sync, 
//like authStart other actions are async, like authSignIn)
//We can use the "return dispatch => " for async actions thanks to redux-thunk
//So an action creator can dispatch another action creator...
export const auth = (email, password, isSignup) => {
  return dispatch => {
    dispatch(authStart());
    const authData = {
      email: email,
      password: password,
    };

    const attributeList = [];

    const dataEmail = {
      Name: 'email',
      Value: authData.email
    };

    const attributeEmail = new CognitoUserAttribute(dataEmail);

    attributeList.push(attributeEmail);

    userPool.signUp(authData.email, authData.password, attributeList, null, (err, result) => {
      if (err) {
        dispatch(authFail(err));
        return;
      }

      dispatch(authSuccess());
    });
    return;
  }
    
};

//Action creator dispatching sync or async actions (some of our actions are sync, 
//like authStart other actions are async, like authSignIn)
//We can use the "return dispatch => " for async actions thanks to redux-thunk
//So an action creator can dispatch another action creator...
export const confirmUser = (email, code, isSignup) => {
  return dispatch => {
    dispatch(authStart());

    const userData = {
      Username: email,
      Pool: userPool
    };

    const cognitUser = new CognitoUser(userData);
    cognitUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        dispatch(authFail(err));
        return;
      }
      dispatch(authConfirmed(result));

    });
    return;
  }
};

//Action creator dispatching sync or async actions (some of our actions are sync, 
//like authStart other actions are async, like authSignIn)
//We can use the "return dispatch => " for async actions thanks to redux-thunk
//So an action creator can dispatch another action creator...
export const signIn = (email, password) => {
  return dispatch => {
    dispatch(authStart());
    
    const authData = {
      Username: email,
      Password: password
    };
    
    const authDetails = new AuthenticationDetails(authData);
    
    const userData = {
      Username: email,
      Pool: userPool
    };
    const cognitoUser = new CognitoUser(userData);
    cognitoUser.authenticateUser(authDetails, {
      onSuccess (result) {
        dispatch(authSignIn(result));
        //after 1 hour of signin, automatically signout
        //note that in the authCheckState action creator we also
        //signout after 1 hour if the user refreshes the page
        //I only need one of these actions to be dispatched
        //but in the future I'll probably use authCheckState 
        //to check whether there's any inactivity and if there is
        //then signout the user within a few minutes
        dispatch(checkAuthTimeout(3600));
      },
      onFailure(err) {
        dispatch(authFail(err));
      }
    });

    return;


  }
}

//Action creator
export const setAuthRedirectPath = path => {
  return {
    type: actionTypes.SET_AUTH_REDIRECT_PATH,
    path: path
  };
};

//Action creator dispatching sync or async actions (some of our actions are sync, 
//like authStart other actions are async, like authSignIn)
//We can use the "return dispatch => " for async actions thanks to redux-thunk
//IN THIS ACTION CREATOR, we try to fix the problem that when you refresh
//the page the redux state becomes empty again so, because the session
//is still valid, I'm setting the token to NOT null (i.e. whith this 
//logic the user automatically signs in without having to re-enter 
//their sign in credentials).
export const authCheckState = () => {
  let currentDate = new Date().getTime();
  return dispatch => {
    const user = userPool.getCurrentUser();
    //so if user is not truthy (so, if null, undefined, 0, "", false, NaN)
    if (!user) {
      dispatch(logout());
    } else {
      user.getSession((err, session) => {
        const timeLapsedSinceAuth = currentDate-session.accessToken.payload.auth_time*1000
        if(err) {
          dispatch(logout());
        } else {
          if (session.isValid()) {
            console.log(timeLapsedSinceAuth)
            //When the user refreshes page, if 1 hour has passed then logout
            if(timeLapsedSinceAuth > 3600*1000) {

              dispatch(logout());
            } else {
              //WITHOUT setTimeout, I kept on getting the app to crash on me
              // In the recessionIndicator container There's something that needs 
              // to happen before the authStateValid is dispatched. I don't
              //know what it is, I think it's related to the react-vis library
              //that calls for a lot of the lifecycle methods that are no longer
              // supported... 
              //The error message says "Uncaught Invariant Violation: Maximum update
              // depth exceeded"... "the error occurred in the <FlexibleXYPlot> component"
              //Either way, delaying the dispatch solves the problem.
              setTimeout(() => {
                dispatch(authStateValid(session));
              }, 2500);
            }
          } else {
            dispatch(logout());
          }
        }
      })
    }
    return
  };
}; 
