import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL!;

async function runMigration() {
  console.log('🔧 Running education migration...');
  
  const sql = postgres(DATABASE_URL);

  try {
    // Check if the education table exists and has old structure
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'education'
      );
    `;

    if (tableExists[0].exists) {
      console.log('📝 Migrating education description field...');
      
      // Check if description is text type
      const columnType = await sql`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'education' 
        AND column_name = 'description';
      `;

      if (columnType[0]?.data_type === 'text') {
        console.log('Converting text description to jsonb array...');
        
        // Migrate existing data
        await sql`
          ALTER TABLE education 
          ADD COLUMN description_temp jsonb;
        `;

        await sql`
          UPDATE education 
          SET description_temp = CASE 
            WHEN description IS NOT NULL AND description != '' 
            THEN to_jsonb(ARRAY[description])
            ELSE '[]'::jsonb
          END;
        `;

        await sql`
          ALTER TABLE education 
          DROP COLUMN description;
        `;

        await sql`
          ALTER TABLE education 
          RENAME COLUMN description_temp TO description;
        `;

        console.log('✅ Migration completed successfully!');
      } else {
        console.log('⏭️  Description field already migrated, skipping...');
      }
    } else {
      console.log('⏭️  Education table does not exist yet, skipping migration...');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

runMigration()
  .then(() => {
    console.log('Migration finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
