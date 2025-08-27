// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { database } from '../database';
import { User } from '../models';

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Check if admin user already exists
    let adminUser = await User.findOne({ where: { email: 'admin@thales.com' } });
    if (!adminUser) {
      adminUser = await User.create({
        email: 'admin@thales.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
      });
      console.log('✅ Admin user created:', adminUser.email);
    } else {
      console.log('ℹ️  Admin user already exists:', adminUser.email);
    }


    
    // Check if test user already exists
    let testUser = await User.findOne({ where: { email: 'user@thales.com' } });
    if (!testUser) {
      testUser = await User.create({
        email: 'user@thales.com',
        password: 'user123',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        isActive: true,
      });
      console.log('✅ Test user created:', testUser.email);
    } else {
      console.log('ℹ️  Test user already exists:', testUser.email);
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('📝 Test credentials:');
    console.log('   Admin: admin@thales.com / admin123');
    console.log('   User:  user@thales.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed(); 