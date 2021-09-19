import {get} from 'lodash';
import {createSelector} from "reselect";


const account = state => get(state, 'web3.account');
export const accountSelector = createSelector(account, a => a);

const networkId = state => get(state, 'web3.networkId', 0);
export const networkIdSelector = createSelector(networkId, a => a);

const web3 = state => get(state, 'web3.connection');
export const web3Selector = createSelector(web3, w => w);

const tokenLoaded = state => get(state, 'token.loaded', false);
export const tokenLoadedSelector = createSelector(tokenLoaded, tl => tl);

const token = state => get(state, 'token.contract');
export const tokenSelector = createSelector(token,t => t);

const tokenBalance = state => get(state, 'token.balance');
export const tokenBalanceSelector = createSelector(tokenBalance, tb => tb);

const tokenName = state => get(state, 'token.symbol');
const tokenSymbol = state => get(state, 'token.name');
export const tokenBasicsSelector = createSelector(tokenName, tokenSymbol, (tn, ts) => ({
    name: tn,
    symbol: ts
}))

const sablierLoaded = state => get(state, 'sablier.loaded', false);
export const sablierLoadedSelector = createSelector(sablierLoaded, sl => sl);

const sablier = state => get(state, 'sablier.contract');
export const sablierSelector = createSelector(sablier,s => s);

export const contractLoaded = createSelector(sablierLoaded, tokenLoaded, (sl, tl) => sl && tl);