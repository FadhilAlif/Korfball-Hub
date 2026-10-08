import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

async function runSeed() {
  console.log('🌱 Starting Database Migration & Seed...');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    // 1. Run schema.sql
    console.log('📜 Executing schema.sql...');
    const schemaPath = path.resolve(__dirname, '../../../Database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('✅ Database schema verified/created successfully.');

    // 2. Check if team already exists
    const teamCheck = await client.query("SELECT id FROM teams WHERE name = 'Korfball Bantul' LIMIT 1;");
    let teamId;

    if (teamCheck.rows.length === 0) {
      console.log('🏢 Seeding Team & Season...');
      const teamRes = await client.query(`
        INSERT INTO teams (name, category, region, home_venue, description)
        VALUES ('Korfball Bantul', 'Senior', 'Bantul', 'GOR Dwi Windu Bantul', 'Korfball Bantul official team management.')
        RETURNING id;
      `);
      teamId = teamRes.rows[0].id;

      const seasonRes = await client.query(`
        INSERT INTO seasons (team_id, name, start_date, end_date, is_active)
        VALUES ($1, '2026/2027', '2026-01-01', '2026-12-31', true)
        RETURNING id;
      `, [teamId]);
      const seasonId = seasonRes.rows[0].id;

      // 3. Seed Users
      console.log('👤 Seeding Users (Manager, Coach)...');
      await client.query(`
        INSERT INTO users (email, full_name, role, status)
        VALUES 
          ('manager@korfballbantul.com', 'Fadhil Manager', 'MANAGER', 'ACTIVE'),
          ('coach@korfballbantul.com', 'Budi Santoso (Coach)', 'COACH', 'ACTIVE')
        ON CONFLICT (email) DO NOTHING;
      `);

      // 4. Seed 10 Athletes (Mixed Gender: 5 Men, 5 Women)
      console.log('🏃 Seeding 10 Athletes (5 M, 5 F) with Active Rosters...');
      const sampleAthletes = [
        { id: 'KB-01', name: 'Andi Pratama', gender: 'MALE', no: 7, pos: 'Attacker' },
        { id: 'KB-02', name: 'Rian Hidayat', gender: 'MALE', no: 10, pos: 'Collector' },
        { id: 'KB-03', name: 'Dimas Setiawan', gender: 'MALE', no: 4, pos: 'Defender' },
        { id: 'KB-04', name: 'Fajar Nugroho', gender: 'MALE', no: 9, pos: 'All-round' },
        { id: 'KB-05', name: 'Bayu Saputra', gender: 'MALE', no: 12, pos: 'Attacker' },
        { id: 'KB-06', name: 'Siti Rahmawati', gender: 'FEMALE', no: 5, pos: 'Attacker' },
        { id: 'KB-07', name: 'Dewi Lestari', gender: 'FEMALE', no: 8, pos: 'Collector' },
        { id: 'KB-08', name: 'Anisa Putri', gender: 'FEMALE', no: 3, pos: 'Defender' },
        { id: 'KB-09', name: 'Rina Astuti', gender: 'FEMALE', no: 11, pos: 'All-round' },
        { id: 'KB-10', name: 'Maya Indah', gender: 'FEMALE', no: 6, pos: 'Defender' },
      ];

      for (let i = 0; i < sampleAthletes.length; i++) {
        const a = sampleAthletes[i];
        const athRes = await client.query(`
          INSERT INTO athletes (team_id, player_id, full_name, date_of_birth, gender, jersey_number, position, join_date, status)
          VALUES ($1, $2, $3, '2002-05-15', $4, $5, $6, '2026-01-10', 'ACTIVE')
          RETURNING id;
        `, [teamId, a.id, a.name, a.gender, a.no, a.pos]);

        const athId = athRes.rows[0].id;

        // User account for athlete
        await client.query(`
          INSERT INTO users (email, full_name, role, athlete_id, status)
          VALUES ($1, $2, 'ATHLETE', $3, 'ACTIVE')
          ON CONFLICT (email) DO NOTHING;
        `, [`${a.id.toLowerCase()}@korfballbantul.com`, a.name, athId]);

        // Active Roster (Andi Pratama as Captain)
        await client.query(`
          INSERT INTO rosters (team_id, season_id, athlete_id, jersey_number, is_captain, status)
          VALUES ($1, $2, $3, $4, $5, 'ACTIVE');
        `, [teamId, seasonId, athId, a.no, a.no === 7]);
      }

      // 5. Seed Training Session Demo
      console.log('⚽ Seeding Demo Training Session & Activities...');
      const coachUser = await client.query("SELECT id FROM users WHERE role = 'COACH' LIMIT 1;");
      const coachId = coachUser.rows[0].id;

      const trainRes = await client.query(`
        INSERT INTO training_sessions (team_id, coach_id, session_date, start_datetime, end_datetime, venue, objective, notes, status)
        VALUES ($1, $2, CURRENT_DATE + INTERVAL '2 day', CURRENT_TIMESTAMP + INTERVAL '2 day', CURRENT_TIMESTAMP + INTERVAL '2 day 2 hour', 'GOR Dwi Windu', 'Shooting accuracy & Defensive rebounding', 'Bring both home and away jerseys', 'SCHEDULED')
        RETURNING id;
      `, [teamId, coachId]);

      const trainId = trainRes.rows[0].id;

      await client.query(`
        INSERT INTO training_activities (training_session_id, activity_name, category, duration, objective, sequence)
        VALUES 
          ($1, 'Dynamic Warm-up & Jogging', 'WARMUP', 15, 'Muscle activation', 1),
          ($1, 'Korfball Shooting Drills 4m & 6m', 'TECHNICAL', 45, 'Shot precision', 2),
          ($1, 'Rebound & Transition 2v2', 'TACTICAL', 40, 'Defensive awareness', 3),
          ($1, 'Cool-down & Debrief', 'COOLDOWN', 20, 'Recovery', 4);
      `, [trainId]);

      // 6. Seed Demo Match
      console.log('🏆 Seeding Demo Upcoming Match...');
      await client.query(`
        INSERT INTO matches (team_id, season_id, opponent, competition, match_date, start_time, venue, home_away, status)
        VALUES ($1, $2, 'Korfball Sleman', 'Kejurda DIY 2026', CURRENT_DATE + INTERVAL '7 day', '15:30', 'GOR Dwi Windu Bantul', 'HOME', 'SCHEDULED');
      `, [teamId, seasonId]);

      // 7. Seed Sample Announcement
      console.log('📢 Seeding Sample Announcement...');
      await client.query(`
        INSERT INTO announcements (team_id, author_id, title, body, priority, target_audience, status)
        VALUES ($1, $2, 'Selamat Datang di Musim 2026/2027 Korfball Bantul', 'Jadwal latihan dan agenda Kejurda telah dipublikasikan. Mohon semua atlet memeriksa ketersediaan kehadiran.', 'IMPORTANT', 'ALL_TEAM', 'PUBLISHED');
      `, [teamId, coachId]);

      console.log('🎉 Seed completed successfully!');
    } else {
      console.log('ℹ️ Team already exists, skipping initial seed insertion.');
    }
  } catch (err) {
    console.error('❌ Migration/Seed error:', err);
    throw err;
  } finally {
    await client.end();
  }
}

runSeed();
