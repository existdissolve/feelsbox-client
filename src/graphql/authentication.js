import gql from 'graphql-tag';

export const login = gql`
    mutation login($email: String!) {
        login(email: $email)
    }
`;
