let todosDeputados = [];
let todasProposicoes = [];

// Função para carregar deputados (igual antes)
async function carregarDeputados() {
  const url = 'https://dadosabertos.camara.leg.br/api/v2/deputados?itens=100&ordenarPor=nome&ordem=asc';
  const res = await fetch(url);
  const data = await res.json();
  todosDeputados = data.dados;
  preencherFiltros(todosDeputados);
  renderizarDeputados(todosDeputados);
}

async function carregarProposicoes() {
  try {
    const url = 'https://dadosabertos.camara.leg.br/api/v2/proposicoes?itens=10&ordem=desc';
    const res = await fetch(url);
    if (!res.ok) {
      console.error('Erro na API de proposições:', res.status);
      return;
    }
    const data = await res.json();
    if (!data.dados) {
      console.error('Dados das proposições não encontrados');
      return;
    }
    renderizarProposicoes(data.dados);
  } catch (e) {
    console.error('Erro ao carregar proposições:', e);
  }
}


// Renderizar deputados no container
function renderizarDeputados(deputados) {
  const container = document.getElementById('deputados-list');
  container.innerHTML = '';

  if (deputados.length === 0) {
    container.innerHTML = '<p>Nenhum deputado encontrado.</p>';
    return;
  }

  deputados.forEach(d => {
    container.innerHTML += `
      <div class="politico-card">
        <img src="${d.urlFoto}" alt="Foto de ${d.nome}" />
        <h3>${d.nome}</h3>
        <p><strong>Partido:</strong> ${d.siglaPartido}</p>
        <p><strong>Estado:</strong> ${d.siglaUf}</p>
        <p><a href="${d.uri}" target="_blank" rel="noopener noreferrer">Perfil Oficial</a></p>
      </div>
    `;
  });
}

// Renderizar proposições no container
function renderizarProposicoes(proposicoes) {
  const container = document.getElementById('proposicoes-list');
  container.innerHTML = ''; // limpa

  proposicoes.forEach(prop => {
    const dataFormatada = new Date(prop.dataApresentacao).toLocaleDateString('pt-BR');

    const card = document.createElement('div');
    card.classList.add('card-proposicao');

    card.innerHTML = `
      <h3>${prop.siglaTipo} ${prop.numero}/${prop.ano}</h3>
      <p><strong>Ementa:</strong> ${prop.ementa || 'Sem descrição'}</p>
      <p><strong>Data:</strong> ${dataFormatada}</p>
    `;

    container.appendChild(card);
  });
}

// Preencher filtros Estado e Partido com os dados dos deputados
function preencherFiltros(deputados) {
  const estadosSet = new Set();
  const partidosSet = new Set();

  deputados.forEach(d => {
    estadosSet.add(d.siglaUf);
    partidosSet.add(d.siglaPartido);
  });

  const estadoFilter = document.getElementById('estado-filter');
  const partidoFilter = document.getElementById('partido-filter');

  // Limpa antes de preencher
  estadoFilter.innerHTML = '<option value="">Filtrar por Estado</option>';
  partidoFilter.innerHTML = '<option value="">Filtrar por Partido</option>';

  Array.from(estadosSet).sort().forEach(uf => {
    estadoFilter.innerHTML += `<option value="${uf}">${uf}</option>`;
  });

  Array.from(partidosSet).sort().forEach(p => {
    partidoFilter.innerHTML += `<option value="${p}">${p}</option>`;
  });
}

// Função que aplica o filtro para deputados e proposições simultaneamente
function aplicarFiltro() {
  const estado = document.getElementById('estado-filter').value;
  const partido = document.getElementById('partido-filter').value;

  // Filtrar deputados
  const deputadosFiltrados = todosDeputados.filter(d => {
    return (estado === '' || d.siglaUf === estado) &&
           (partido === '' || d.siglaPartido === partido);
  });

  renderizarDeputados(deputadosFiltrados);

  // Filtrar proposições: vamos filtrar só pelo estado do autor (para simplificar)
  const proposicoesFiltradas = todasProposicoes.filter(p => {
    // Proposições têm um array de autores, cada um com 'siglaUf' (estado)
    if (!p.autores || p.autores.length === 0) return false;

    return p.autores.some(autor => {
      if (estado !== '' && autor.siglaUf !== estado) return false;

      // Se partido estiver preenchido, ignorar para proposições (pode melhorar depois)
      return true;
    });
  });

  renderizarProposicoes(proposicoesFiltradas);
}

// Controle de abas
document.getElementById('btn-deputados').addEventListener('click', () => {
  mostrarSecao('deputados-section');
  ativarBotao('btn-deputados');
});

document.getElementById('btn-proposicoes').addEventListener('click', () => {
  mostrarSecao('proposicoes-section');
  ativarBotao('btn-proposicoes');
});

function mostrarSecao(id) {
  document.getElementById('deputados-section').classList.add('hidden');
  document.getElementById('proposicoes-section').classList.add('hidden');
  document.getElementById(id).classList.remove('hidden');
}

function ativarBotao(id) {
  document.querySelectorAll('.menu button').forEach(btn => btn.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Evento aplicar filtro
document.getElementById('filter-btn').addEventListener('click', aplicarFiltro);

// Carregamento inicial
window.onload = () => {
  carregarDeputados();
  carregarProposicoes();
};
