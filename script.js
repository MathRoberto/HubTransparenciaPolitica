let todosDeputados = [];
let todasProposicoes = []; // Agora armazena TODAS as proposições carregadas para filtragem local

// Função para carregar deputados (permanece similar)
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

// Função para carregar proposições (inicialmente, sem filtros de data ou tipo)
async function carregarProposicoesIniciais() {
    // Carregamos um número maior de proposições para permitir filtragem local
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
        todasProposicoes = data.dados; // Armazena todas as proposições
        preencherFiltrosProposicoes(todasProposicoes); // Preenche o novo filtro de tipo
        renderizarProposicoes(todasProposicoes); // Renderiza todas inicialmente
    } catch (e) {
        console.error('Erro ao carregar proposições:', e);
        renderizarProposicoes([]);
    }
}

// Renderizar deputados no container (sem alterações)
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

// Renderizar proposições no container (DATA REMOVIDA)
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

// Preencher filtros Estado e Partido para Deputados (sem alterações)
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

// Preencher filtro de Tipo para Proposições (sem alterações)
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

// Função EXCLUSIVA para aplicar filtro de Deputados (sem alterações)
function aplicarFiltroDeputados() {
    const estado = document.getElementById('estado-filter').value;
    const partido = document.getElementById('partido-filter').value;

    const deputadosFiltrados = todosDeputados.filter(d => {
        return (estado === '' || d.siglaUf === estado) &&
               (partido === '' || d.siglaPartido === partido);
    });

    renderizarDeputados(deputadosFiltrados);
}

// Função EXCLUSIVA para aplicar filtro de Proposições (AGORA APENAS POR TIPO)
async function aplicarFiltroProposicoes() {
    const siglaTipo = document.getElementById('tipo-proposicao-filter').value;

    let proposicoesFiltradas = todasProposicoes; // Começa com todas as proposições carregadas

    // Filtra por siglaTipo (se houver)
    if (siglaTipo !== '') {
        proposicoesFiltradas = proposicoesFiltradas.filter(prop => {
            return prop.siglaTipo === siglaTipo;
        });
    }

    renderizarProposicoes(proposicoesFiltradas);
}

// Controle de abas e visibilidade dos filtros (sem alterações)
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

    document.getElementById('filtro-deputados').classList.add('hidden');
    document.getElementById('filtro-proposicoes').classList.add('hidden');

    document.getElementById(id).classList.remove('hidden');
    if (id === 'deputados-section') {
        document.getElementById('filtro-deputados').classList.remove('hidden');
    } else if (id === 'proposicoes-section') {
        document.getElementById('filtro-proposicoes').classList.remove('hidden');
    }
}

function ativarBotao(id) {
    document.querySelectorAll('.menu button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// Eventos dos botões de filtro
document.getElementById('filter-btn').addEventListener('click', aplicarFiltroDeputados);
document.getElementById('filter-proposicoes-btn').addEventListener('click', aplicarFiltroProposicoes);

// Carregamento inicial ao carregar a página
window.onload = () => {
    carregarDeputados();
    carregarProposicoesIniciais(); // Chama a função para carregar proposições
    mostrarSecao('deputados-section');
    ativarBotao('btn-deputados');
};