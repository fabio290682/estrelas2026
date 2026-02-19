import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo") || "mes";
    const regiao = searchParams.get("regiao");

    // Calculate date range based on period
    let dateFilter = "";
    switch (periodo) {
      case "hoje":
        dateFilter = "AND a.data_cadastro >= CURRENT_DATE";
        break;
      case "semana":
        dateFilter = "AND a.data_cadastro >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case "mes":
        dateFilter = "AND a.data_cadastro >= CURRENT_DATE - INTERVAL '30 days'";
        break;
      case "trimestre":
        dateFilter = "AND a.data_cadastro >= CURRENT_DATE - INTERVAL '90 days'";
        break;
      case "ano":
        dateFilter =
          "AND a.data_cadastro >= CURRENT_DATE - INTERVAL '365 days'";
        break;
    }

    let regionFilter = "";
    if (regiao && regiao !== "Todas") {
      regionFilter = `AND LOWER(p.bairro) = LOWER('${regiao}')`;
    }

    // Get KPIs
    const kpisQuery = `
      SELECT 
        COUNT(DISTINCT a.id_animal) as total_animais,
        COUNT(DISTINCT a.id_proprietario) as total_proprietarios,
        ROUND(
          (COUNT(CASE WHEN a.vacinado = TRUE THEN 1 END)::DECIMAL / 
           NULLIF(COUNT(a.id_animal), 0)) * 100, 1
        ) as taxa_vacinacao,
        ROUND(COUNT(DISTINCT a.id_animal)::DECIMAL / 
              NULLIF(COUNT(DISTINCT p.bairro), 0), 1) as animais_por_regiao
      FROM animais a
      LEFT JOIN proprietarios p ON a.id_proprietario = p.id_proprietario
      WHERE a.status = 'ativo' ${dateFilter} ${regionFilter}
    `;

    const kpisResult = await sql(kpisQuery);
    const kpis = kpisResult[0] || {
      total_animais: 0,
      total_proprietarios: 0,
      taxa_vacinacao: 0,
      animais_por_regiao: 0,
    };

    // Get animal type distribution
    const animalTypesQuery = `
      SELECT 
        a.tipo,
        COUNT(*) as count,
        ROUND((COUNT(*)::DECIMAL / SUM(COUNT(*)) OVER()) * 100, 1) as percentage
      FROM animais a
      LEFT JOIN proprietarios p ON a.id_proprietario = p.id_proprietario
      WHERE a.status = 'ativo' ${dateFilter} ${regionFilter}
      GROUP BY a.tipo
      ORDER BY count DESC
    `;
    const animalTypes = await sql(animalTypesQuery);

    // Get regional distribution
    const regionalDistributionQuery = `
      SELECT 
        COALESCE(p.bairro, 'Não informado') as regiao,
        COUNT(DISTINCT a.id_animal) as count
      FROM animais a
      LEFT JOIN proprietarios p ON a.id_proprietario = p.id_proprietario
      WHERE a.status = 'ativo' ${dateFilter} ${regionFilter}
      GROUP BY p.bairro
      ORDER BY count DESC
      LIMIT 10
    `;
    const regionalDistribution = await sql(regionalDistributionQuery);

    // Get vaccination trend (last 6 months)
    const vaccinationTrendQuery = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', a.data_cadastro), 'Mon') as month,
        COUNT(CASE WHEN a.vacinado = TRUE THEN 1 END) as vaccinated,
        COUNT(*) as total
      FROM animais a
      LEFT JOIN proprietarios p ON a.id_proprietario = p.id_proprietario
      WHERE a.data_cadastro >= CURRENT_DATE - INTERVAL '6 months' 
        AND a.status = 'ativo' ${regionFilter}
      GROUP BY DATE_TRUNC('month', a.data_cadastro)
      ORDER BY DATE_TRUNC('month', a.data_cadastro)
    `;
    const vaccinationTrend = await sql(vaccinationTrendQuery);

    // Get age distribution
    const ageDistributionQuery = `
      SELECT 
        CASE 
          WHEN a.idade IS NULL THEN 'Não informado'
          WHEN a.idade BETWEEN 0 AND 1 THEN '0-1'
          WHEN a.idade BETWEEN 2 AND 3 THEN '1-3'
          WHEN a.idade BETWEEN 4 AND 7 THEN '3-7'
          WHEN a.idade BETWEEN 8 AND 10 THEN '7-10'
          ELSE '10+'
        END as age_group,
        COUNT(*) as count
      FROM animais a
      LEFT JOIN proprietarios p ON a.id_proprietario = p.id_proprietario
      WHERE a.status = 'ativo' ${dateFilter} ${regionFilter}
      GROUP BY age_group
      ORDER BY 
        CASE age_group
          WHEN '0-1' THEN 1
          WHEN '1-3' THEN 2
          WHEN '3-7' THEN 3
          WHEN '7-10' THEN 4
          WHEN '10+' THEN 5
          ELSE 6
        END
    `;
    const ageDistribution = await sql(ageDistributionQuery);

    return Response.json({
      kpis: {
        total_animais: parseInt(kpis.total_animais) || 0,
        total_proprietarios: parseInt(kpis.total_proprietarios) || 0,
        taxa_vacinacao: parseFloat(kpis.taxa_vacinacao) || 0,
        animais_por_regiao: parseFloat(kpis.animais_por_regiao) || 0,
      },
      animalTypes,
      regionalDistribution,
      vaccinationTrend,
      ageDistribution,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
