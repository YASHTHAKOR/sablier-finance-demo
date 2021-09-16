import {useEffect} from 'react';
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
import Client from './Services/graphQL';

function App() {

    const dispatch = useDispatch();

    useEffect(async () => {
        const web3 = loadWeb3(dispatch);
        const networkId = await web3.eth.net.getId()
        const account = await loadAccount(web3, dispatch);
        const token = loadToken(web3, networkId, dispatch);
        const sablier = loadSablier(web3, networkId, dispatch)
        await loadBalances(dispatch, web3, token, account);
        if (!token) {
            window.alert('Contract not deployed to the current network. Please select another network with metamask');
            return;
        }
        if (!sablier) {
            window.alert('Contract not deployed to the current network. Please select another network with metamask');
            return;
        }
    }, []);

    const allContractLoaded = useSelector(contractLoaded);

    return (
        <ApolloProvider client={Client}>
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
    );
}

export default App;
