// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { database } from '../database';
import { User } from '../models';

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Create admin user
    const adminUser = await User.create({
      email: 'admin@thales.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
    });
    
    console.log('✅ Admin user created:', adminUser.email);
    
    // Create test user
    const testUser = await User.create({
      email: 'user@thales.com',
      password: 'user123',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      isActive: true,
    });
    
    console.log('✅ Test user created:', testUser.email);
    
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