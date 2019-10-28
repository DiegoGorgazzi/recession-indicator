import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../utility';

const initialState = {
    token: null,
    error: null,
    loading: false,
    authRedirectPath: '/',
    confirmed: false  
};

const authStart = ( state, action ) => {
    return updateObject( state, { error: null, loading: true } );
};

const authSuccess = (state, action) => {
    return updateObject( state, { 
        error: null,
        loading: false
     } );
};

const authConfirmed = (state, action) => {
    return updateObject( state, { 
        error: null,
        loading: false,
        confirmed: true
     } );
};

const authSignIn = (state, action) => {
    return updateObject( state, { 
        token: action.userSession,
        error: null,
        loading: false,
        confirmed: true
     } );
};

const authStateValid = (state, action) => {
    return updateObject( state, { 
        token: action.userSession,
        error: null,
        loading: false,
        confirmed: true
     } );
};



const authFail = (state, action) => {
    return updateObject( state, {
        error: action.error,
        loading: false
    });
};

const authLogout = (state, action) => {
  return updateObject(state, {
    token: null,
    userId: null,
    confirmed: false
  });
};

const setAuthRedirectPath = (state, action) => {
    return updateObject(state, { authRedirectPath: action.path })
}

const reducer = ( state = initialState, action ) => {
    switch ( action.type ) {
        case actionTypes.AUTH_START: return authStart(state, action);
        case actionTypes.AUTH_SUCCESS: return authSuccess(state, action);
        case actionTypes.AUTH_FAIL: return authFail(state, action);
        case actionTypes.AUTH_LOGOUT: return authLogout(state, action);
        case actionTypes.AUTH_CONFIRMED: return authConfirmed(state, action);
        case actionTypes.AUTH_SIGNIN: return authSignIn(state, action);
        case actionTypes.AUTH_STATE_VALID: return authStateValid(state, action);
        case actionTypes.SET_AUTH_REDIRECT_PATH: return setAuthRedirectPath(state,action);
        default:
            return state;
    }
};

export default reducer;