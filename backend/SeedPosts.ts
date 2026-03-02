import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

import Post from './src/models/postModel';
import User from './src/models/userModel';

const MONGODB_URI = 'mongodb://localhost:27017/BiteWise';

const seedPosts = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // get users to assign as owners
    const users = await User.find();

    if (users.length === 0) {
      throw new Error('No users found. Run user seed first.');
    }

    // uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads');

    const imageFiles = fs
      .readdirSync(uploadsDir)
      .filter(file =>
        ['.jpg', '.jpeg', '.png', '.webp'].includes(
          path.extname(file).toLowerCase()
        )
      );

    if (imageFiles.length === 0) {
      throw new Error('No images found in uploads folder');
    }

    // sample data pools
    const cuisines = ['Italian', 'American', 'Mediterranean', 'Asian', 'Healthy'];

    const posts = imageFiles.map((file, index) => {
      const owner = users[index % users.length];

      return {
        title: `Recipe ${index + 1}`,
        description: `Delicious homemade recipe #${index + 1}`,
        cuisine: cuisines[index % cuisines.length],
        imgUrl: `/uploads/${file}`, // matches your static serving path
        owner: owner._id,
        likes: [],

        ingredients: [
          { name: 'Olive Oil', amount: '2 tbsp' },
          { name: 'Garlic', amount: '2 cloves' },
          { name: 'Salt', amount: 'to taste' }
        ],

        instructions: [
          'Prepare all ingredients.',
          'Cook on medium heat.',
          'Serve and enjoy.'
        ],

        nutrition: {
          calories: 450 + index * 10,
          protein: 20 + index,
          confidence: 0.9,
          suggestions: 'Add vegetables for extra nutrients.'
        }
      };
    });

    // clear existing posts
    await Post.deleteMany({});
    console.log('🧹 Old posts removed');

    await Post.insertMany(posts);

    console.log(`🎉 Successfully seeded ${posts.length} posts`);

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedPosts();