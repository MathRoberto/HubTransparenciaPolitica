// Carregar cotações ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadExchangeRates();
    loadNews();
});

function loadExchangeRates() {
    // Dólar
    fetch('https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao=\'06-24-2025\'&$top=1&$orderby=cotacaoCompra desc&$format=json')
        .then(response => response.json())
        .then(data => {
            const dolar = data.value[0].cotacaoCompra;
            document.getElementById('dolar-value').innerText = `R$ ${dolar.toFixed(2)}`;
            window.currentDolar = dolar;
        });

    // Euro
    fetch('https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoEuroDia(dataCotacao=@dataCotacao)?@dataCotacao=\'06-24-2025\'&$top=1&$orderby=cotacaoCompra desc&$format=json')
        .then(response => response.json())
        .then(data => {
            const euro = data.value[0].cotacaoCompra;
            document.getElementById('euro-value').innerText = `R$ ${euro.toFixed(2)}`;
            window.currentEuro = euro;
        });

    // Taxa Selic
    fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.4189/dados/ultimos/1?formato=json')
        .then(response => response.json())
        .then(data => {
            const selic = data[0].valor;
            document.getElementById('selic-value').innerText = `${selic}% a.a.`;
        });
}

function convertCurrency() {
    const amount = parseFloat(document.getElementById('amount').value);
    const currency = document.getElementById('currency').value;

    if (isNaN(amount)) {
        alert('Digite um valor válido.');
        return;
    }

    let rate = currency === 'USD' ? window.currentDolar : window.currentEuro;
    const result = amount / rate;

    document.getElementById('conversion-result').innerText = `≈ ${currency} ${result.toFixed(2)}`;
}

function consultCNPJ() {
    let cnpjInput = document.getElementById('cnpj').value;

    // Remove tudo que não for número
    const cnpj = cnpjInput.replace(/\D/g, '');

    if (!cnpj || cnpj.length !== 14) {
        alert('Digite um CNPJ válido com 14 números.');
        return;
    }

    fetch(`https://receitaws.com.br/v1/cnpj/${cnpj}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ERROR') {
                document.getElementById('cnpj-result').innerText = 'CNPJ não encontrado.';
            } else {
                document.getElementById('cnpj-result').innerHTML = `
                    <p><strong>Nome:</strong> ${data.nome}</p>
                    <p><strong>Situação:</strong> ${data.situacao}</p>
                    <p><strong>Endereço:</strong> ${data.logradouro}, ${data.bairro} - ${data.municipio}/${data.uf}</p>
                `;
            }
        })
        .catch(() => {
            document.getElementById('cnpj-result').innerText = 'Erro ao consultar CNPJ.';
        });
}


function loadNews() {
    // Usando NewsAPI
    const apiKey = '7a67384d04f74b92b0c196a0a5aa9dea';
    fetch(`https://newsapi.org/v2/top-headlines?country=br&category=business&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const newsList = document.getElementById('news-list');
            newsList.innerHTML = '';

            data.articles.slice(0, 5).forEach(article => {
                const newsItem = document.createElement('div');
                newsItem.classList.add('news-item');
                newsItem.innerHTML = `
                    <h4>${article.title}</h4>
                    <a href="${article.url}" target="_blank">Leia mais</a>
                `;
                newsList.appendChild(newsItem);
            });
        })
        .catch(() => {
            document.getElementById('news-list').innerText = 'Erro ao carregar notícias.';
        });
}
