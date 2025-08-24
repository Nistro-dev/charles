import { database } from '../database';
import { initializeModels } from '../models';

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Initialize models
    initializeModels();
    
    // Sync database (create tables)
    await database.sync({ force: false, alter: true });
    
    console.log('✅ Database migration completed successfully!');
    console.log('📊 Tables created/updated:');
    
    // List all tables
    const tables = await database.showAllSchemas({});
    console.log(tables);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate(); 