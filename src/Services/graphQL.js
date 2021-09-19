import {
    ApolloClient,
    InMemoryCache,
} from "@apollo/client";

const networkIdGraphUrl = {
    1: 'https://api.thegraph.com/subgraphs/name/sablierhq/sablier',
    42: 'https://api.thegraph.com/subgraphs/name/sablierhq/sablier-kovan'
}

const ClientInit = (networkId) => {
    return (new ApolloClient({
        uri: networkIdGraphUrl[networkId],
        cache: new InMemoryCache()
    }));
}


export default ClientInit;