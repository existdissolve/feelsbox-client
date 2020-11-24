import gql from 'graphql-tag';

export const addFeel = gql`
    mutation addFeel($data: FeelInput!) {
        addFeel(data: $data) {
            _id
        }
    }
`;

export const cloneFromHistory = gql`
    mutation cloneFromHistory($_id: ID!) {
        cloneFromHistory(_id: $_id)
    }
`;

export const copyFeel = gql`
    mutation copyFeel($_id: ID!) {
        copyFeel(_id: $_id)
    }
`;

export const editFeel = gql`
    mutation editFeel($_id: ID!, $data: FeelInput!) {
        editFeel(_id: $_id, data: $data) {
            _id
        }
    }
`;

export const getFeel = gql`
    query getFeel($_id: ID!) {
        feel(_id: $_id) {
            _id
            categories {
                _id
                name
            }
            duration
            frames {
                brightness
                duration
                isThumb
                pixels {
                    color
                    position
                }
            }
            name
            private
            repeat
            reverse
        }
    }
`;

export const getFeels = gql`
    query getFeels($criteria: FeelSearchCriteriaInput) {
        feels(criteria: $criteria) {
            _id
            active
            categories {
                _id
                name
            }
            frames {
                brightness
                duration
                isThumb
                pixels {
                    color
                    position
                }
            }
            isOwner
            isSubscribed
            name
        }
    }
`;

export const removeFeel = gql`
    mutation removeFeel($_id: ID!) {
        removeFeel(_id: $_id) {
            _id
            active
        }
    }
`;

export const subscribe = gql`
    mutation subscribe($_id: ID!) {
        subscribe(_id: $_id) {
            _id
            isSubscribed
        }
    }
`;

export const sendFeel = gql`
    mutation sendFeel($_id: ID!, $data: SendFeelInput) {
        sendFeel(_id: $_id, data: $data)
    }
`;

export const testFeel = gql`
    mutation testFeel($feel: TestFeelInput!) {
        testFeel(feel: $feel)
    }
`;

export const unsubscribe = gql`
    mutation unsubscribe($_id: ID!) {
        unsubscribe(_id: $_id) {
            _id
            isSubscribed
        }
    }
`;