import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './src/models/userModel';

const MONGODB_URI = 'mongodb://localhost:27017/BiteWise';

const seedUsers = async (): Promise<void> => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB successfully.");

        // Define one single password for all users
        const commonPassword = 'password123';
        const hashedPassword = await bcrypt.hash(commonPassword, 10);

        const users = [
            {
                username: 'Noa_Admin',
                email: 'noa@example.com',
                password: hashedPassword,
                imgUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noa',
                refreshTokens: []
            },
            {
                username: 'Liad_Dev',
                email: 'liad@example.com',
                password: hashedPassword,
                imgUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liad',
                refreshTokens: []
            },
            {
                username: 'Gordon_R',
                email: 'gordon@chef.com',
                password: hashedPassword,
                imgUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gordon',
                refreshTokens: []
            },
            {
                username: 'Jamie_O',
                email: 'jamie@kitchen.com',
                password: hashedPassword,
                imgUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jamie',
                refreshTokens: []
            },
            {
                username: 'Foodie_Gal',
                email: 'foodie@test.com',
                password: hashedPassword,
                imgUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Foodie',
                refreshTokens: []
            }
        ];

        // Clear and Insert
        await User.deleteMany({}); // Clears existing users to avoid duplicates
        await User.insertMany(users);
        
        console.log(`Success: Added 5 users with the password: ${commonPassword}`);

    } catch (error) {
        console.error("Error while seeding users:", error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

seedUsers();

