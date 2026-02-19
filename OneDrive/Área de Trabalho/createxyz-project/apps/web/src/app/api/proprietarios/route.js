import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const cidade = searchParams.get('cidade');
    const bairro = searchParams.get('bairro');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    let query = 'SELECT * FROM proprietarios WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (LOWER(nome_completo) LIKE LOWER($${paramCount}) OR cpf LIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (cidade) {
      paramCount++;
      query += ` AND LOWER(cidade) = LOWER($${paramCount})`;
      params.push(cidade);
    }

    if (bairro) {
      paramCount++;
      query += ` AND LOWER(bairro) = LOWER($${paramCount})`;
      params.push(bairro);
    }

    query += ` ORDER BY data_cadastro DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const proprietarios = await sql(query, params);

    return Response.json({ proprietarios });
  } catch (error) {
    console.error('Error fetching proprietarios:', error);
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      nome_completo,
      cpf,
      rg,
      data_nascimento,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cep,
      latitude,
      longitude,
      telefone_principal,
      telefone_secundario,
      whatsapp,
      email,
      renda_familiar,
      profissao
    } = body;

    // Validate required fields
    if (!nome_completo || !cpf) {
      return Response.json({ error: 'Nome completo e CPF são obrigatórios' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO proprietarios (
        nome_completo, cpf, rg, data_nascimento, logradouro, numero, complemento,
        bairro, cidade, estado, cep, latitude, longitude, telefone_principal,
        telefone_secundario, whatsapp, email, renda_familiar, profissao
      ) VALUES (
        ${nome_completo}, ${cpf}, ${rg}, ${data_nascimento}, ${logradouro}, ${numero},
        ${complemento}, ${bairro}, ${cidade}, ${estado}, ${cep}, ${latitude},
        ${longitude}, ${telefone_principal}, ${telefone_secundario}, ${whatsapp},
        ${email}, ${renda_familiar}, ${profissao}
      ) RETURNING *
    `;

    return Response.json({ proprietario: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating proprietario:', error);
    if (error.message.includes('duplicate key')) {
      return Response.json({ error: 'CPF já cadastrado' }, { status: 409 });
    }
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}