import {useEffect, useState} from 'react';
import {useSelector, useDispatch} from "react-redux";
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from "react-router-dom";
import {
  ApolloProvider
} from "@apollo/client"
import {
    loadWeb3,
    loadAccount,
    loadToken,
    loadSablier,
    loadBalances
} from './store/interactions';
import {
    contractLoaded
} from './store/selectors';
import Main from './Components/Main';
import StreamInfo from './Components/StreamInfo';
import ClientInit from './Services/graphQL';

function App() {

    const dispatch = useDispatch();
    const [Client, SetClient] = useState(ClientInit(1));

    const supportedNetworks = [1,42];

    const initConnection = async () => {
        const web3 = loadWeb3(dispatch);
        const networkId = await web3.eth.net.getId();
        if(!supportedNetworks.includes(networkId)) {
            window.alert('Network not supported. Please select another network with metamask');
            return;
        }
        const account = await loadAccount(web3, dispatch);
        const token = loadToken(web3, networkId, dispatch);
        const sablier = loadSablier(web3, networkId, dispatch);
        SetClient(ClientInit(networkId));
        await loadBalances(dispatch, web3, token, account);
        if (!token) {
            window.alert('Contract not deployed to the current network. Please select another network with metamask');
            return;
        }
        if (!sablier) {
            window.alert('Contract not deployed to the current network. Please select another network with metamask');
            return;
        }

        window.ethereum.on('accountsChanged', function (accounts) {
            window.alert('account change detected');
            initConnection();
        })

        window.ethereum.on('networkChanged', function (networkId) {
            window.alert('network change detected');
            initConnection();
        })
    }

    useEffect(initConnection, []);

    const allContractLoaded = useSelector(contractLoaded);

    return <ApolloProvider client={Client}>
            <div>
                {allContractLoaded && <Router>
                    <Switch>
                        <Route
                            key={'home'}
                            path={'/'}
                            exact={true}
                            children={<Main/>}
                        />
                        <Route
                            key={'streamInfo'}
                            path={'/stream/:id'}
                            exact={true}
                            children={<StreamInfo/>}
                        />
                    </Switch>
                </Router>}
            </div>
        </ApolloProvider>
}

export default App;
