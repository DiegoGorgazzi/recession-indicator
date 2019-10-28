import reducer from './auth';
import * as actionTypes from '../actions/actionTypes';

describe('auth reducer', () => {
    it('should return the initial state', () => {
        expect(reducer(undefined, {})).toEqual({
            token: null,
            error: null,
            loading: false,
            authRedirectPath: '/',
            confirmed: false  
        });
    });

    it('should store the token upon login and confirm user', () => {
        expect(reducer({
            token: null,
            error: null,
            loading: false,
            authRedirectPath: '/',
            confirmed: false  
        }, { 
            type: actionTypes.AUTH_SIGNIN,
            userSession: 'some-token'
         })).toEqual({
            token: 'some-token',
            error: null,
            loading: false,
            authRedirectPath: '/',
            confirmed: true  
        });
    })
});
