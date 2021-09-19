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

export function networkIdLoaded(networkId) {
    return {
        type: 'NETWORK_ID_ACCOUNT_LOADED',
        networkId
    }
}

export function tokenLoaded(contract) {
    return {
        type: 'TOKEN_LOADED',
        contract
    }
}

export function tokenBasicsLoaded({
                                      tokenSymbol,
                                      tokenName
                                  }) {

    return {
        type: 'TOKEN_BASICS_LOADED',
        tokenSymbol,
        tokenName
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
