import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const tipo = searchParams.get('tipo');
    const status = searchParams.get('status');
    const proprietario_id = searchParams.get('proprietario_id');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    let query = `
      SELECT a.*, p.nome_completo as proprietario_nome, p.cidade, p.bairro
      FROM animais a 
      LEFT JOIN proprietarios p ON a.id_proprietario = p.id_proprietario 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (LOWER(a.nome) LIKE LOWER($${paramCount}) OR LOWER(a.raca) LIKE LOWER($${paramCount}) OR LOWER(p.nome_completo) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
    }

    if (tipo) {
      paramCount++;
      query += ` AND a.tipo = $${paramCount}`;
      params.push(tipo);
    }

    if (status) {
      paramCount++;
      query += ` AND a.status = $${paramCount}`;
      params.push(status);
    }

    if (proprietario_id) {
      paramCount++;
      query += ` AND a.id_proprietario = $${paramCount}`;
      params.push(proprietario_id);
    }

    query += ` ORDER BY a.data_cadastro DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const animais = await sql(query, params);

    return Response.json({ animais });
  } catch (error) {
    console.error('Error fetching animais:', error);
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      id_proprietario,
      nome,
      tipo,
      subtipo,
      raca,
      sexo,
      idade,
      peso,
      porte,
      cor_pelagem,
      castrado,
      vacinado,
      vermifugado,
      condicoes_especiais,
      veterinario_responsavel,
      microchip,
      registro_municipal,
      pedigree,
      observacoes,
      status
    } = body;

    // Validate required fields
    if (!id_proprietario || !nome || !tipo || !sexo) {
      return Response.json({ 
        error: 'Proprietário, nome, tipo e sexo são obrigatórios' 
      }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO animais (
        id_proprietario, nome, tipo, subtipo, raca, sexo, idade, peso, porte,
        cor_pelagem, castrado, vacinado, vermifugado, condicoes_especiais,
        veterinario_responsavel, microchip, registro_municipal, pedigree,
        observacoes, status
      ) VALUES (
        ${id_proprietario}, ${nome}, ${tipo}, ${subtipo}, ${raca}, ${sexo},
        ${idade}, ${peso}, ${porte}, ${cor_pelagem}, ${castrado}, ${vacinado},
        ${vermifugado}, ${condicoes_especiais}, ${veterinario_responsavel},
        ${microchip}, ${registro_municipal}, ${pedigree}, ${observacoes},
        ${status || 'ativo'}
      ) RETURNING *
    `;

    return Response.json({ animal: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating animal:', error);
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}