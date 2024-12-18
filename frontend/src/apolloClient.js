// src/apolloClient.js
import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
    uri: 'http://localhost:4000',  // Adjust this URL if your backend is on a different port
    cache: new InMemoryCache()
});

export default client;
