import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();
const prisma = new PrismaClient();

async function main() {
  const a = await prisma.athlete.create({
    data: {
      full_name: 'João Silva',
      cpf: '123.456.789-09',
      birth_date: new Date('2010-05-20'),
      gender: 'M',
      whatsapp: '(11) 91234-5678'
    }
  });

  await prisma.address.create({
    data: {
      athlete_id: a.id,
      street: 'Rua Exemplo',
      number: '123',
      neighborhood: 'Centro',
      city: 'Cidade Ex',
      uf: 'SP'
    }
  });

  await prisma.schoolEnrollment.create({
    data: {
      athlete_id: a.id,
      school_name: 'Escola Municipal Exemplo',
      grade: '1EF',
      shift: 'M'
    }
  });

  await prisma.medicalInfo.create({
    data: {
      athlete_id: a.id,
      medical_restriction: false,
      allergies: false,
      blood_type: 'O+'
    }
  });

  await prisma.guardian.create({
    data: {
      athlete_id: a.id,
      name: 'Maria Silva',
      cpf: '987.654.321-00',
      phone: '(11) 99876-5432'
    }
  });

  await prisma.submission.create({
    data: {
      athlete_id: a.id,
      protocol_number: 'EST-2026-00001',
      status: 'submitted'
    }
  });

  console.log('Seed concluído');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
