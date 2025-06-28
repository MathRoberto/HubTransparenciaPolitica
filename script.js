let todosDeputados = [];
let todasProposicoes = [];
let todasNoticias = []; 
// --- Funções de Carregamento de Dados ---

async function carregarDeputados() {
  const url = 'https://dadosabertos.camara.leg.br/api/v2/deputados?itens=100&ordenarPor=nome&ordem=asc';
  try {
    const res = await fetch(url);
    const data = await res.json();
    todosDeputados = data.dados;
    preencherFiltrosDeputados(todosDeputados);
    renderizarDeputados(todosDeputados);
  } catch (e) {
    console.error('Erro ao carregar deputados:', e);
  }
}

async function carregarProposicoesIniciais() {
  const url = 'https://dadosabertos.camara.leg.br/api/v2/proposicoes?itens=500&ordem=desc';
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error('Erro na API de proposições:', res.status);
      renderizarProposicoes([]);
      return;
    }
    const data = await res.json();
    if (!data.dados) {
      console.error('Dados das proposições não encontrados');
      renderizarProposicoes([]);
      return;
    }
    todasProposicoes = data.dados;
    preencherFiltrosProposicoes(todasProposicoes);
    renderizarProposicoes(todasProposicoes);
  } catch (e) {
    console.error('Erro ao carregar proposições:', e);
    renderizarProposicoes([]);
  }
}

async function carregarNoticias(query = '') {
  const defaultQuery = "política"; 
  const searchTerm = query.trim() === '' ? defaultQuery : (query);

  const functionUrl = `/.netlify/functions/get-news?query=${encodeURIComponent(searchTerm)}`;

  try {
    const res = await fetch(functionUrl);
    if (!res.ok) {
      const errorData = await res.json();
      console.error('Erro ao chamar Netlify Function (Notícias):', res.status, errorData.message || 'Erro desconhecido.');
      renderizarNoticias([]);
      return;
    }
    
    const data = await res.json(); 

    if (data.status === 'ok' && data.articles) {
      todasNoticias = data.articles; 
      renderizarNoticias(todasNoticias);
    } else {
      console.error('Dados de notícias não encontrados ou status não OK da função:', data.message);
      renderizarNoticias([]);
    }

  } catch (e) {
    console.error('Erro inesperado ao carregar notícias (requisição para Netlify Function falhou):', e);
    renderizarNoticias([]);
  }
}


// --- Funções de Renderização ---

function renderizarDeputados(deputados) {
  const container = document.getElementById('deputados-list');
  container.innerHTML = '';

  if (deputados.length === 0) {
    container.innerHTML = '<p>Nenhum deputado encontrado para os critérios selecionados.</p>';
    return;
  }

  deputados.forEach(d => {
    container.innerHTML += `
      <div class="politico-card">
        <img src="${d.urlFoto}" alt="Foto de ${d.nome}" onerror="this.onerror=null;this.src='https://via.placeholder.com/120x140?text=Sem+Foto';" />
        <h3>${d.nome}</h3>
        <p><strong>Partido:</strong> ${d.siglaPartido}</p>
        <p><strong>Estado:</strong> ${d.siglaUf}</p>
        <p><a href="https://www.camara.leg.br/deputados/${d.id}" target="_blank" rel="noopener noreferrer">Perfil Oficial</a></p>
      </div>
    `;
  });
}

function renderizarProposicoes(proposicoes) {
  const container = document.getElementById('proposicoes-list');
  container.innerHTML = '';

  if (proposicoes.length === 0) {
    container.innerHTML = '<p>Nenhuma proposição encontrada para os critérios selecionados.</p>';
    return;
  }

  proposicoes.forEach(prop => {
    container.innerHTML += `
      <div class="proposicao-card">
        <h3>${prop.siglaTipo} ${prop.numero}/${prop.ano}</h3>
        <p><strong>Ementa:</strong> ${prop.ementa || 'Sem descrição'}</p>
        <p><a href="${prop.uri}" target="_blank" rel="noopener noreferrer">Detalhes</a></p>
      </div>
    `;
  });
}

function renderizarNoticias(noticias) {
  const container = document.getElementById('noticias-list');
  container.innerHTML = '';

  if (noticias.length === 0) {
    container.innerHTML = '<p>Nenhuma notícia encontrada.</p>';
    return;
  }

  noticias.forEach(n => {
    container.innerHTML += `
      <div class="noticia-card">
        <h3>${n.title || 'Sem Título'}</h3>
        <p><strong>Fonte:</strong> ${n.source?.name || 'Desconhecida'}</p>
        <p>${n.description || 'Sem descrição'}</p>
        ${n.urlToImage ? `<img src="${n.urlToImage}" alt="${n.title}" onerror="this.onerror=null;this.src='https://via.placeholder.com/150?text=Sem+Imagem';" />` : ''}
        <p><a href="${n.url}" target="_blank" rel="noopener noreferrer">Leia Mais</a></p>
      </div>
    `;
  });
}


// --- Funções de Preenchimento de Filtros (para deputados e proposições) ---

function preencherFiltrosDeputados(deputados) {
  const estadosSet = new Set();
  const partidosSet = new Set();

  deputados.forEach(d => {
    estadosSet.add(d.siglaUf);
    partidosSet.add(d.siglaPartido);
  });

  const estadoFilter = document.getElementById('estado-filter');
  const partidoFilter = document.getElementById('partido-filter');

  estadoFilter.innerHTML = '<option value="">Filtrar por Estado</option>';
  partidoFilter.innerHTML = '<option value="">Filtrar por Partido</option>';

  Array.from(estadosSet).sort().forEach(uf => {
    estadoFilter.innerHTML += `<option value="${uf}">${uf}</option>`;
  });

  Array.from(partidosSet).sort().forEach(p => {
    partidoFilter.innerHTML += `<option value="${p}">${p}</option>`;
  });
}

function preencherFiltrosProposicoes(proposicoes) {
  const tiposSet = new Set();
  proposicoes.forEach(p => {
    if (p.siglaTipo) {
      tiposSet.add(p.siglaTipo);
    }
  });

  const tipoFilter = document.getElementById('tipo-proposicao-filter');
  tipoFilter.innerHTML = '<option value="">Filtrar por Tipo</option>';

  Array.from(tiposSet).sort().forEach(tipo => {
    tipoFilter.innerHTML += `<option value="${tipo}">${tipo}</option>`;
  });
}


// --- Funções de Aplicação de Filtros ---

function aplicarFiltroDeputados() {
  const estado = document.getElementById('estado-filter').value;
  const partido = document.getElementById('partido-filter').value;

  const deputadosFiltrados = todosDeputados.filter(d => {
    return (estado === '' || d.siglaUf === estado) &&
       (partido === '' || d.siglaPartido === partido);
  });

  renderizarDeputados(deputadosFiltrados);
}

function aplicarFiltroProposicoes() {
  const siglaTipo = document.getElementById('tipo-proposicao-filter').value;

  let proposicoesFiltradas = todasProposicoes;

  if (siglaTipo !== '') {
    proposicoesFiltradas = proposicoesFiltradas.filter(prop => {
      return prop.siglaTipo === siglaTipo;
    });
  }

  renderizarProposicoes(proposicoesFiltradas);
}


// --- Controle de Abas e Visibilidade de Filtros ---

document.getElementById('btn-deputados').addEventListener('click', () => {
  mostrarSecao('deputados-section');
  ativarBotao('btn-deputados');
});

document.getElementById('btn-proposicoes').addEventListener('click', () => {
  mostrarSecao('proposicoes-section');
  ativarBotao('btn-proposicoes');
});

// EVENTO: Botão para a aba de Notícias
document.getElementById('btn-noticias').addEventListener('click', () => {
  mostrarSecao('noticias-section');
  ativarBotao('btn-noticias');
  carregarNoticias(); 
});

document.getElementById('filter-noticias-btn').addEventListener('click', () => {
  const query = document.getElementById('search-noticias').value;
  carregarNoticias(query); 
});

// --- Event Listeners para Aplicação de Filtros (ADICIONADO ESTE BLOCO) ---
document.getElementById('filter-btn').addEventListener('click', aplicarFiltroDeputados);
document.getElementById('filter-proposicoes-btn').addEventListener('click', aplicarFiltroProposicoes);


function mostrarSecao(id) {
  // Esconde todas as seções principais
  document.getElementById('deputados-section').classList.add('hidden');
  document.getElementById('proposicoes-section').classList.add('hidden');
  document.getElementById('noticias-section').classList.add('hidden'); // Adicionado

  // Esconde todas as barras de filtro
  document.getElementById('filtro-deputados').classList.add('hidden');
  document.getElementById('filtro-proposicoes').classList.add('hidden');
  document.getElementById('filtro-noticias').classList.add('hidden'); // Adicionado

  // Mostra a seção selecionada
  document.getElementById(id).classList.remove('hidden');

  // Mostra a barra de filtro correspondente
  if (id === 'deputados-section') {
    document.getElementById('filtro-deputados').classList.remove('hidden');
  } else if (id === 'proposicoes-section') {
    document.getElementById('filtro-proposicoes').classList.remove('hidden');
  } else if (id === 'noticias-section') { // Adicionado
    document.getElementById('filtro-noticias').classList.remove('hidden');
  }
}

function ativarBotao(id) {
  document.querySelectorAll('.menu button').forEach(btn => btn.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}


// --- Carregamento Inicial ao Abrir a Página ---

window.onload = () => {
  carregarDeputados();
  carregarProposicoesIniciais();
  mostrarSecao('deputados-section');
  ativarBotao('btn-deputados');
  // As notícias serão carregadas apenas quando a aba 'Notícias' for clicada.
};