import gql from 'graphql-tag';

export const getMessages = gql`
    query getMessages {
        messages {
            _id
            createdAt
            createdBy {
                name
            }
            feelSnapshot {
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
                repeat
                reverse
            }
            message
        }
    }
`;
