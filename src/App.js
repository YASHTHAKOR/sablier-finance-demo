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
import {withStyles} from "@material-ui/core/styles";

const styles = () => ({
    appContainer: {
        height: '100vh',
        overflow: 'auto',
        background: 'linear-gradient(135deg, rgba(1, 186, 198, 0.15) 19.47%, rgba(1, 186, 198, 0.05) 88.4%)',
        '& *': {
            zIndex: 1
        }
    },
    bottomBack: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-around',
        zIndex: 0,
        alignItems: 'baseline'
    },
    topBack: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-around',
        zIndex: 0,
        alignItems: 'flex-start'
    },
    bar: {
        width: '50px',
        borderTopLeftRadius: '25px',
        borderTopRightRadius: '25px',
        background: 'rgba(1, 186, 198, 0.20)'
    },
    bar2: {
        width: '50px',
        borderBottomLeftRadius: '25px',
        borderBottomRightRadius: '25px',
        background: 'rgba(1, 186, 198, 0.20)'
    }
});

function App({ classes }) {

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

    const barHeights = Array
        .from({ length: Math.round(Math.random() * 20 + 10) })
        .map(() => Math.round(Math.random() * 70 + 10));
    return <ApolloProvider client={Client}>
            <div className={classes.appContainer}>
                <div className={classes.topBack}>
                    {barHeights.map((height, index) => <div className={classes.bar2} style={{ height: `calc(100vh - ${height}vh - 30px)` }}/>)}
                </div>
                <div className={classes.bottomBack}>
                    {barHeights.map((height, index) => <div className={classes.bar} style={{ height: `${height}vh` }}/>)}
                </div>
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

export default withStyles(styles)(App);
