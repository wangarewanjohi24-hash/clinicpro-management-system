import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Patient {
    id: ID!
    name: String!
    age: Int
    condition: String
  }

  type Query {
    patients: [Patient]
  }
`;

export const resolvers = {
  Query: {
    patients: async () => {
      return [];
    },
  },
};