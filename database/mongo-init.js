// This script creates a MongoDB user with read/write permissions
// If you're having issues with database creation in Docker, check the following:
// 1. Make sure the database name matches MONGO_INITDB_DATABASE in docker-compose.yml (currently "nft-minting-app")
// 2. Ensure this file is properly mounted as a volume in docker-compose.yml
// 3. Verify Docker has proper permissions to access this file
// 4. Check Docker logs with: docker logs nft-mongodb

db.getSiblingDB('nft-minting-app').createUser(
    {
        user: "admin",
        pwd: "admin",
        roles: [
            {
                role: "readWrite",
                db: "nft-minting-app"
            }
        ]
    }
);

// Create collections based on your models
db.getSiblingDB('nft-minting-app').createCollection('collections');
db.getSiblingDB('nft-minting-app').createCollection('metadata');
db.getSiblingDB('nft-minting-app').createCollection('mintingStatus');

// Create indexes for better performance
db.getSiblingDB('nft-minting-app').collections.createIndex({ name: 1 });
db.getSiblingDB('nft-minting-app').metadata.createIndex({ tokenId: 1 });
db.getSiblingDB('nft-minting-app').mintingStatus.createIndex({ address: 1 });
