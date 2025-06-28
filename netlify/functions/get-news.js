// netlify/functions/get-news.js
const fetch = require('node-fetch'); // O Netlify Functions já fornece 'node-fetch'

exports.handler = async function(event, context) {
    // Acessa a variável de ambiente definida no painel do Netlify
    const NEWS_API_KEY = process.env.VITE_NEWS_API_KEY; 

    // Pega o parâmetro 'query' da URL da requisição do frontend
    const query = event.queryStringParameters.query || '';

    let url;
    if (query.trim() === "política OR senado OR câmara OR congresso") {
        // Se a query for o termo padrão, usa o endpoint top-headlines de política do Brasil
        // A NewsAPI exige 'country' ou 'sources' para top-headlines.
        url = `https://newsapi.org/v2/top-headlines?country=br&category=politics&apiKey=${NEWS_API_KEY}`;
    } else {
        // Caso contrário, usa o endpoint everything para busca livre
        url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=pt&sortBy=relevancy&apiKey=${NEWS_API_KEY}`;
    }

    // Se a API Key não estiver definida, retorne um erro (ótimo para depuração)
    if (!NEWS_API_KEY) {
        console.error("NEWS_API_KEY não configurada na Netlify Function.");
        return {
            statusCode: 500,
            body: JSON.stringify({ status: "error", message: "API Key da News API não configurada." })
        };
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Retorna a resposta da News API para o frontend
        return {
            statusCode: response.status,
            headers: {
                // Isso permite que seu frontend (que está em outro domínio) acesse a função
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error("Erro na Netlify Function ao buscar notícias:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ status: "error", message: "Erro interno do servidor ao buscar notícias." })
        };
    }
};