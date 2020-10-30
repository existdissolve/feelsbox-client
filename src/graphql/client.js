import {ApolloClient} from 'apollo-client';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {HttpLink} from 'apollo-link-http';

const env = process.env.NODE_ENV;
const uri = env === 'development' ? '/api/graphql' : 'https://feelsbox-server-v2.herokuapp.com/api/graphql';

export default new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
        credentials: 'same-origin',
        uri
    })
});
