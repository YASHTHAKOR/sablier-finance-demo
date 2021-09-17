import Web3 from 'web3';
import Token from "../abis/Token.json";
import Sablier from '../abis/Sablier.json';
import {
    web3Loaded,
    web3AccountLoaded,
    tokenLoaded,
    etherBalanceLoaded,
    tokenBalanceLoaded,
    sablierLoaded
} from './actions';

export const loadWeb3 = (dispatch) => {
    const web3 = new Web3(window.ethereum || 'http://localhost:8545');
    dispatch(web3Loaded(web3));
    return web3;
}

export const loadAccount = async (web3, dispatch) => {
    await window.ethereum.enable()
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    dispatch(web3AccountLoaded(account));
    return account;
}

export const loadToken = (web3, networkId, dispatch) => {

    try {
        const token = new web3.eth.Contract(Token.abi, Token.networks[networkId].address);
        dispatch(tokenLoaded(token));
        return token;
    } catch (Err) {
        console.log('Contract not deployed to the current network. Please select another network with metamask');
        return null;
    }

}

export const loadSablier = (web3, networkId, dispatch) => {

    try {
        const sablier = new web3.eth.Contract(Sablier.abi, Sablier.networks[networkId].address);
        dispatch(sablierLoaded(sablier));
        return sablier;
    } catch (Err) {
        console.log('Contract not deployed to the current network. Please select another network with metamask');
        return null;
    }

}

export const loadBalances = async (dispatch, web3, token, account) => {

    const etherBalance = await web3.eth.getBalance(account);
    dispatch(etherBalanceLoaded(etherBalance));

    const tokenBalance = await token.methods.balanceOf(account).call();
    dispatch(tokenBalanceLoaded(tokenBalance));

}


export const approveToken = (dispatch, sablier, web3, token, amount, account) => {
    amount = web3.utils.toWei(amount, 'ether');
    return new Promise((resolve, reject) => {
        token.methods.approve(sablier.options.address, amount).send({from: account})
            .on('transactionHash', (hash) => {
                resolve(hash);
            })
            .on('error', (error) => {
                console.log(error);
                window.alert('there was an error');
                reject(error);
            })
    })

}

export const createSablierStream = (dispatch, sablier, web3, token, account, {
    recipient,
    deposit,
    startTime,
    stopTime
}) => {
    return new Promise((resolve, reject) => {
        console.log(recipient, deposit, token.options.address, startTime, stopTime);
        sablier.methods.createStream(recipient, deposit, token.options.address, startTime, stopTime).send({from: account})
            .on('transactionHash', (hash) => {
              debugger;
            })
            .on('receipt', (data) => {
                debugger;
                resolve(data);
            })
            .on('error', (error) => {
                console.log(error);
                window.alert('there was an error');
                reject(error);
            });
    })

}

export const withdrawSablierFromStream = (dispatch, sablier, web3, account, streamId, amount) => {
    return new Promise((resolve, reject) => {
        sablier.methods.withdrawFromStream(streamId, amount).send({from: account})
            .on('transactionHash', (hash) => {
                debugger;
            })
            .on('receipt', (data) => {
                debugger;
                resolve(data);
            })
            .on('error', (error) => {
                console.log(error);
                window.alert('there was an error');
                reject(error);
            });
    })
}

export const cancelSablierStream = (dispatch, sablier, streamId, account) => {
    return new Promise((resolve, reject) => {
        sablier.methods.cancelStream(streamId).send({from: account})
            .on('transactionHash', (hash) => {
                debugger;
            })
            .on('receipt', (data) => {
                debugger;
                resolve(data);
            })
            .on('error', (error) => {
                console.log(error);
                window.alert('there was an error');
                reject(error);
            });
    })
}

export const sablierStreamBalances = async (dispatch, sablier, web3,streamId, sender, receiver, account) => {
    try {
        let senderBalance = await sablier.methods.balanceOf(Number(streamId), sender).call();
        let receiverBalance = await sablier.methods.balanceOf(Number(streamId), receiver).call();

        return {
            senderBalance,
            receiverBalance
        }
    } catch (Err) {
        return {
            senderBalance: 0,
            receiverBalance: 0
        }
    }

}