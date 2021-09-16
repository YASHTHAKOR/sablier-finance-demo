export function web3Loaded(connection) {
    return {
        type: 'WEB3_LOADED',
        connection
    }
}

export function web3AccountLoaded(account) {
    return {
        type: 'WEB3_ACCOUNT_LOADED',
        account
    }
}

export function tokenLoaded(contract) {
    return {
        type: 'TOKEN_LOADED',
        contract
    }
}

export function etherBalanceLoaded(balance) {
    return {
        type: 'ETHER_BALANCE_LOADED',
        balance
    }
}
export function tokenBalanceLoaded(balance) {
    return {
        type: 'TOKEN_BALANCE_LOADED',
        balance
    }
}

export function sablierLoaded(contract) {
    return {
        type: 'SABLIER_LOADED',
        contract
    }
}
