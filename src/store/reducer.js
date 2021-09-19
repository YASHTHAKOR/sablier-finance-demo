import {combineReducers} from "redux";

function web3(state = {}, action) {
    switch (action.type) {
        case 'WEB3_LOADED':
            return {
                ...state,
                connection: action.connection
            }
        case 'WEB3_ACCOUNT_LOADED':
            return {
                ...state,
                account: action.account
            }
        case 'NETWORK_ID_ACCOUNT_LOADED':
            return {
                ...state,
                networkId: action.networkId
            }
        case 'ETHER_BALANCE_LOADED':
            return {...state, balance: action.balance}
        default:
            return state;
    }
}

function token(state = [], action) {
    switch (action.type) {
        case 'TOKEN_LOADED':
            return {
                ...state,
                contract: action.contract,
                loaded: true
            }
        case 'TOKEN_BASICS_LOADED':
            return {
                ...state,
                symbol:  action.tokenSymbol,
                name: action.tokenName
            }
        case 'TOKEN_BALANCE_LOADED':
            return {...state, balance: action.balance}
        default:
            return state;
    }
}

function sablier (state = [], action) {
    switch (action.type) {
        case 'SABLIER_LOADED':
            return {
                ...state,
                contract: action.contract,
                loaded: true
            }
        default:
            return state;
    }
}

const rootReduces = combineReducers({
    web3,
    token,
    sablier
})

export default rootReduces;