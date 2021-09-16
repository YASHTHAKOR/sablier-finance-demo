import {
    ApolloClient,
    InMemoryCache,
} from "@apollo/client";

const Client = new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/sablierhq/sablier-kovan',
    cache: new InMemoryCache()
});


export default Client;