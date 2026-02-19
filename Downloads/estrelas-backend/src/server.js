import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();
const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 4000;

// upload setup
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g,'_'))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

app.use(express.json());

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// Endpoint para receber o formulário (multipart/form-data)
app.post('/api/athletes', upload.single('photo'), async (req, res) => {
  try {
    const body = req.body;

    // validação mínima
    if (!body.fullName || !body.cpf || !body.birthDate) {
      return res.status(400).json({ error: 'fullName, cpf e birthDate são obrigatórios' });
    }

    // Criar atleta
    const athlete = await prisma.athlete.create({
      data: {
        full_name: body.fullName,
        cpf: body.cpf,
        birth_date: new Date(body.birthDate),
        gender: body.gender || 'O',
        whatsapp: body.whatsapp || '',
        weight: body.weight ? parseFloat(body.weight) : null,
        height: body.height ? parseFloat(body.height) : null,
        shirt_size: body.shirt || null,
        shoe: body.shoe ? parseInt(body.shoe) : null,
        position: body.position || null,
        dominant_foot: body.foot || null,
        nis: body.nis || null,
        photo_url: req.file ? '/uploads/' + path.basename(req.file.path) : null
      }
    });

    // Endereço
    if (body.street) {
      await prisma.address.create({
        data: {
          athlete_id: athlete.id,
          street: body.street,
          number: body.number || null,
          neighborhood: body.neighborhood || '',
          city: body.city || '',
          uf: body.uf || ''
        }
      });
    }

    // Escolaridade
    if (body.school) {
      await prisma.schoolEnrollment.create({
        data: {
          athlete_id: athlete.id,
          school_name: body.school,
          grade: body.grade || '',
          shift: body.shift || null
        }
      });
    }

    // Médico
    await prisma.medicalInfo.create({
      data: {
        athlete_id: athlete.id,
        medical_restriction: body.medicalRestriction === 'Y',
        allergies: body.allergies === 'Y',
        allergy_details: body.allergyDetails || null,
        blood_type: body.bloodType || null,
        emergency_contact: body.emergencyContact || null,
        emergency_phone: body.emergencyPhone || null
      }
    });

    // Responsável
    if (body.guardianName) {
      await prisma.guardian.create({
        data: {
          athlete_id: athlete.id,
          name: body.guardianName,
          cpf: body.guardianCpf || '',
          phone: body.guardianPhone || null
        }
      });
    }

    // Submissão
    const protocol = 'EST-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 90000 + 10000);
    const submission = await prisma.submission.create({
      data: {
        athlete_id: athlete.id,
        protocol_number: protocol,
        status: 'submitted'
      }
    });

    return res.status(201).json({ athlete, submission });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno' });
  }
});

app.use('/uploads', express.static(uploadsDir));

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
