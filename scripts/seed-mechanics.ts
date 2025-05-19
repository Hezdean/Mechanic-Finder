import { pool } from '../server/db';

async function seedMechanics() {
  try {
    // First, check if the profiles already exist
    const existingProfiles = await pool.query(`
      SELECT user_id FROM mechanic_profiles WHERE user_id IN (3, 4)
    `);
    
    const existingUserIds = existingProfiles.rows.map((row: any) => row.user_id);
    
    // Insert for user 3 if needed
    if (!existingUserIds.includes(3)) {
      await pool.query(`
        INSERT INTO mechanic_profiles 
        (user_id, specializations, years_of_experience, certifications, hourly_rate, is_mobile, services_offered, verification_documents, is_verified, rating, review_count)
        VALUES 
        (3, ARRAY['Transmission', 'Electrical Systems', 'AC Repair'], 5, ARRAY['BMW Certified'], 55, false, ARRAY['Transmission Repair', 'Electrical Diagnostics', 'AC Service'], ARRAY[]::text[], true, 42, 8)
      `);
      console.log('Added mechanic profile for user 3');
    }
    
    // Insert for user 4 if needed
    if (!existingUserIds.includes(4)) {
      await pool.query(`
        INSERT INTO mechanic_profiles 
        (user_id, specializations, years_of_experience, certifications, hourly_rate, is_mobile, services_offered, verification_documents, is_verified, rating, review_count)
        VALUES 
        (4, ARRAY['Engine Repair', 'Brake Systems', 'Diagnostics'], 8, ARRAY['ASE Master Technician'], 65, true, ARRAY['Oil Change', 'Brake Repair', 'Engine Diagnostics'], ARRAY[]::text[], true, 45, 12)
      `);
      console.log('Added mechanic profile for user 4');
    }
    
    console.log('Successfully seeded mechanic profiles!');
  } catch (error) {
    console.error('Error seeding mechanic profiles:', error);
  } finally {
    await pool.end();
  }
}

seedMechanics();