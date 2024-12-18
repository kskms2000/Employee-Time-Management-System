// index.js
const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');
require('dotenv').config();
const typeDefs = require('./schemas/schema');  // Import type definitions and resolvers from schema.js
const resolvers = require('./resolvers/resolver');  // Import resolvers from resolvers.js

// Connect to MongoDB and Start Apollo Server
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const server = new ApolloServer({ typeDefs, resolvers });
        const { url } = await server.listen({ port: process.env.PORT || 4000 });
        console.log(`Server running at ${url}`);
    } catch (error) {
        console.error('Error connecting to MongoDB or starting server', error);
    }
};

startServer();
