const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type Product {
        id: ID!
        sku: String!
        title: String!
        description: String!
        price: Float!
        discountedPrice: Float!
        imageUrl: String!
    }

    type getProductsData {
        products: [Product!]!
        currentPage: Int!
        hasNextPage: Boolean!
        hasPreviousPage: Boolean!
        nextPage: Int!
        previousPage: Int!
        lastPage: Int!
    }

    type getProductsResult {
        message: String!
        data: getProductsData!
    }

    type productData { product: Product! }

    type productResult {
        message: String!
        data: productData!
    }

    input productInputData {
        sku: String!
        title: String!
        price: Float!
        imageUrl: String!
    }

    type rootQueries {
        getAllProducts(page: Int): getProductsResult!
    }

    type rootMutations {
        addProduct(productInput: productInputData!): productResult!
        updateProduct(productId: ID!, productInput: productInputData!): productResult!
        deleteProduct(productId: ID!): productResult!
    }

    schema {
        query: rootQueries
        mutation: rootMutations
    }
`);
