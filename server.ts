import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import * as db from './db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isMySQL = !!process.env.DB_HOST;
const AUTO_INC = isMySQL ? 'AUTO_INCREMENT' : 'AUTOINCREMENT';

// Initialize Tables
async function initDb() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY ${AUTO_INC},
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      contact TEXT,
      blood_group TEXT,
      weight REAL,
      height REAL,
      medical_history TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`);
    await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_patient_name ON patients(name);

    CREATE TABLE IF NOT EXISTS doctors(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialization TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

    CREATE TABLE IF NOT EXISTS audit_logs(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  ); 

    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY ${AUTO_INC},
      name TEXT NOT NULL,
      specialization TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY ${AUTO_INC},
      name TEXT NOT NULL,
      description TEXT,
      price REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY ${AUTO_INC},
      patient_id INTEGER NOT NULL,
      doctor_id INTEGER NOT NULL,
      service_id INTEGER,
      appointment_date DATE NOT NULL,
      appointment_time TIME NOT NULL,
      status TEXT DEFAULT 'scheduled',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS prescriptions (
      id INTEGER PRIMARY KEY ${AUTO_INC},
      appointment_id INTEGER NOT NULL,
      medication TEXT NOT NULL,
      dosage TEXT,
      frequency TEXT,
      duration TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS billing (
      id INTEGER PRIMARY KEY ${AUTO_INC},
      appointment_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'unpaid',
      payment_method TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS consultations (
      id INTEGER PRIMARY KEY ${AUTO_INC},
      appointment_id INTEGER NOT NULL,
      symptoms TEXT,
      diagnosis TEXT,
      treatment_plan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migration: Ensure service_id exists in appointments
  try {
    if (!isMySQL) {
      const tableInfo = await db.query("PRAGMA table_info(appointments)") as any[];
      const hasServiceId = tableInfo.some(col => col.name === 'service_id');
      if (!hasServiceId) {
        await db.exec("ALTER TABLE appointments ADD COLUMN service_id INTEGER");
        console.log("Added service_id column to appointments table");
      }
    }
  } catch (error) {
    console.error("Migration error:", error);
  }


  // Seed some data if none exist
  const doctorCount = await db.get('SELECT count(*) as count FROM doctors') as { count: number };
  if (doctorCount.count === 0) {
    await db.query('INSERT INTO doctors (name, specialization) VALUES (?, ?)', ['Dr. Sarah Smith', 'General Practitioner']);
    await db.query('INSERT INTO doctors (name, specialization) VALUES (?, ?)', ['Dr. James Wilson', 'Pediatrician']);
    await db.query('INSERT INTO doctors (name, specialization) VALUES (?, ?)', ['Dr. Elena Rodriguez', 'Cardiologist']);
  }

  const serviceCount = await db.get('SELECT count(*) as count FROM services') as { count: number };
  if (serviceCount.count === 0) {
    await db.query('INSERT INTO services (name, description, price) VALUES (?, ?, ?)', ['General Consultation', 'Standard health checkup', 50.00]);
    await db.query('INSERT INTO services (name, description, price) VALUES (?, ?, ?)', ['Pediatric Checkup', 'Specialized care for children', 65.00]);
    await db.query('INSERT INTO services (name, description, price) VALUES (?, ?, ?)', ['Cardiology Screening', 'Heart health assessment', 120.00]);
    await db.query('INSERT INTO services (name, description, price) VALUES (?, ?, ?)', ['Blood Test', 'Comprehensive blood analysis', 45.00]);
  }
}

async function startServer() {
  await initDb();
  const app = express();
  const PORT = process.env.PORT //3000;

  app.use(express.json());

  // API Routes
  // Patients
  app.get('/api/patients', async (req, res) => {
    try {
      const patients = await db.query('SELECT * FROM patients ORDER BY name ASC');
      res.json(patients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      res.status(500).json({ error: 'Failed to fetch patients' });
    }
  });

  app.post('/api/patients', async (req, res) => {
    const { name, age, gender, blood_group, weight, height, medical_history } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: "Invalid Name: Name must be at least 2 characters." });
    }

    // 2. Format Checking (Ensure phone is a number)
    const contactRegex = /^[0-9+]{10,15}$/;
    if (contact && !contactRegex.test(contact)) {
      return res.status(400).json({ error: "Invalid contact: Please enter a valid contact number." });
      // Age Validation (Must be a reasonable number)
      if (age !== undefined && (age < 0 || age > 120)) {
        return res.status(400).json({ error: "Invalid Age: Must be between 0 and 120." });
      }

      // Gender Validation (Restrict to specific options)
      const validGenders = ['Male', 'Female', 'Other'];
      if (gender && !validGenders.includes(gender)) {
        return res.status(400).json({ error: "Invalid Gender: Please select Male, Female, or Other." });
      }

      // Blood Group Validation
      const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      if (blood_group && !validBloodGroups.includes(blood_group)) {
        return res.status(400).json({ error: "Invalid Blood Group format." });
      }

      // Weight & Height (Must be positive numbers)
      if (weight !== undefined && weight <= 0) {
        return res.status(400).json({ error: "Weight must be a positive number." });
      }
      if (height !== undefined && height <= 0) {
        return res.status(400).json({ error: "Height must be a positive number." });
      }

      // Medical History (Prevent dangerously long text)
      if (medical_history && medical_history.length > 2000) {
        return res.status(400).json({ error: "Medical history is too long (Max 2000 characters)." });
      }
      try {
        const { name, age, gender, contact, blood_group, weight, height, medical_history } = req.body;
        const result = await db.query('INSERT INTO patients (name, age, gender, contact, blood_group, weight, height, medical_history) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [name, age, gender, contact, blood_group, weight, height, medical_history]);
        res.json({ id: db.getLastInsertId(result) });
      } catch (error) {
        console.error('Error adding patient:', error);
        res.status(500).json({ error: 'Failed to add patient' });
      }
    });

  app.get('/api/patients/:id', async (req, res) => {
    try {
      const patient = await db.get('SELECT * FROM patients WHERE id = ?', [req.params.id]);
      res.json(patient);
    } catch (error) {
      console.error('Error fetching patient:', error);
      res.status(500).json({ error: 'Failed to fetch patient' });
    }
  });

  // Doctors
  app.get('/api/doctors', async (req, res) => {
    try {
      const doctors = await db.query('SELECT * FROM doctors ORDER BY name ASC');
      res.json(doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      res.status(500).json({ error: 'Failed to fetch doctors' });
    }
  });

  app.post('/api/doctors', async (req, res) => {
    try {
      const { name, specialization } = req.body;
      const result = await db.query('INSERT INTO doctors (name, specialization) VALUES (?, ?)',
        [name, specialization]);
      res.json({ id: db.getLastInsertId(result) });
    } catch (error) {
      console.error('Error adding doctor:', error);
      res.status(500).json({ error: 'Failed to add doctor' });
    }
  });

  // Services
  app.get('/api/services', async (req, res) => {
    try {
      const services = await db.query('SELECT * FROM services ORDER BY name ASC');
      res.json(services);
    } catch (error) {
      console.error('Error fetching services:', error);
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  });

  // Appointments
  app.get('/api/appointments', async (req, res) => {
    try {
      const appointments = await db.query(`
        SELECT a.*, p.name as patient_name, d.name as doctor_name, s.name as service_name 
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
        LEFT JOIN services s ON a.service_id = s.id
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
      `);
      res.json(appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ error: 'Failed to fetch appointments' });
    }
  });

  app.post('/api/appointments', async (req, res) => {
    try {
      const { patient_id, doctor_id, service_id, appointment_date, appointment_time, notes } = req.body;
      const result = await db.query('INSERT INTO appointments (patient_id, doctor_id, service_id, appointment_date, appointment_time, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [patient_id, doctor_id, service_id, appointment_date, appointment_time, notes]);
      res.json({ id: db.getLastInsertId(result) });
    } catch (error) {
      console.error('Error adding appointment:', error);
      res.status(500).json({ error: 'Failed to add appointment' });
    }
  });

  app.patch('/api/appointments/:id', async (req, res) => {
    try {
      const { status, notes } = req.body;
      await db.query('UPDATE appointments SET status = ?, notes = ? WHERE id = ?',
        [status, notes, req.params.id]);
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating appointment:', error);
      res.status(500).json({ error: 'Failed to update appointment' });
    }
  });

  // Prescriptions
  app.get('/api/prescriptions', async (req, res) => {
    try {
      const prescriptions = await db.query(`
        SELECT pr.*, p.name as patient_name, d.name as doctor_name, a.appointment_date
        FROM prescriptions pr
        JOIN appointments a ON pr.appointment_id = a.id
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
        ORDER BY pr.created_at DESC
      `);
      res.json(prescriptions);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      res.status(500).json({ error: 'Failed to fetch prescriptions' });
    }
  });

  app.post('/api/prescriptions', async (req, res) => {
    try {
      const { appointment_id, medication, dosage, frequency, duration, notes } = req.body;
      const result = await db.query('INSERT INTO prescriptions (appointment_id, medication, dosage, frequency, duration, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [appointment_id, medication, dosage, frequency, duration, notes]);
      res.json({ id: db.getLastInsertId(result) });
    } catch (error) {
      console.error('Error adding prescription:', error);
      res.status(500).json({ error: 'Failed to add prescription' });
    }
  });

  // Billing
  app.get('/api/billing', async (req, res) => {
    try {
      const bills = await db.query(`
        SELECT b.*, p.name as patient_name, a.appointment_date
        FROM billing b
        JOIN appointments a ON b.appointment_id = a.id
        JOIN patients p ON a.patient_id = p.id
        ORDER BY b.created_at DESC
      `);
      res.json(bills);
    } catch (error) {
      console.error('Error fetching billing:', error);
      res.status(500).json({ error: 'Failed to fetch billing' });
    }
  });

  app.post('/api/billing', async (req, res) => {
    try {
      const { appointment_id, amount, status, payment_method } = req.body;
      const result = await db.query('INSERT INTO billing (appointment_id, amount, status, payment_method) VALUES (?, ?, ?, ?)',
        [appointment_id, amount, status, payment_method]);
      res.json({ id: db.getLastInsertId(result) });
    } catch (error) {
      console.error('Error adding billing:', error);
      res.status(500).json({ error: 'Failed to add billing' });
    }
  });

  app.patch('/api/billing/:id', async (req, res) => {
    try {
      const { status, payment_method } = req.body;
      await db.query('UPDATE billing SET status = ?, payment_method = ? WHERE id = ?',
        [status, payment_method, req.params.id]);
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating billing:', error);
      res.status(500).json({ error: 'Failed to update billing' });
    }
  });

  // Consultations
  app.get('/api/consultations', async (req, res) => {
    try {
      const consultations = await db.query(`
        SELECT c.*, p.name as patient_name, d.name as doctor_name, a.appointment_date
        FROM consultations c
        JOIN appointments a ON c.appointment_id = a.id
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
        ORDER BY c.created_at DESC
      `);
      res.json(consultations);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      res.status(500).json({ error: 'Failed to fetch consultations' });
    }
  });

  app.post('/api/consultations', async (req, res) => {
    try {
      const { appointment_id, symptoms, diagnosis, treatment_plan } = req.body;
      const result = await db.query('INSERT INTO consultations (appointment_id, symptoms, diagnosis, treatment_plan) VALUES (?, ?, ?, ?)',
        [appointment_id, symptoms, diagnosis, treatment_plan]);
      res.json({ id: db.getLastInsertId(result) });
    } catch (error) {
      console.error('Error adding consultation:', error);
      res.status(500).json({ error: 'Failed to add consultation' });
    }
  });

  // Dashboard Stats (Trend Data)
  app.get('/api/stats/trends', async (req, res) => {
    try {
      const monthFormat = isMySQL ? "DATE_FORMAT(created_at, '%Y-%m')" : "strftime('%Y-%m', created_at)";
      const trends = await db.query(`
        SELECT ${monthFormat} as month, count(*) as count
        FROM patients
        GROUP BY month
        ORDER BY month ASC
        LIMIT 12
      `);
      res.json(trends);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const _dirname = path.resolve();
    app.use(express.static(path.join(_dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(_dirname, 'dist', 'index.html'));
    });
  }

// --- Global Error Handler ---
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("SERVER ERROR LOG:", err.stack);
    res.status(500).json({
      error: "Internal Server Error",
      message: "The clinic system encountered an issue. Please try again later."
    });
  });

  // --- Start Server ---
  app.listen(PORT, '0.0.0.0', () => {
    console.log(Server running on http://localhost:${PORT});
  });

// --- Start the System ---
startServer();

// --- NFR: Global Audit Logging Function ---
async function logAction(action: string, details: string) {
  try {
    await db.run(
      INSERT INTO audit_logs (action, details) VALUES (?, ?),
      [action, details]
    );
    console.log([AUDIT]: ${action} - ${details});
  } catch (error) {
    console.error("Audit logging failed:", error);
  }
}
} 
