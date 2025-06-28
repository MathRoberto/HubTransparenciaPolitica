// netlify/functions/get-news.js
const fetch = require('node-fetch'); // Netlify Functions geralmente já tem node-fetch disponível

exports.handler = async function(event, context) {
    const NEWS_API_KEY = process.env.VITE_NEWS_API_KEY; // Sua chave do Netlify Environment Variables
    const query = event.queryStringParameters.query || "política OR senado OR câmara OR congresso"; // Pega a query do frontend

    let url;
    if (query.trim() === '') {
        url = `https://newsapi.org/v2/top-headlines?country=br&category=politics&apiKey=${NEWS_API_KEY}`;
    } else {
        url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query + " política")}&language=pt&sortBy=relevancy&apiKey=${NEWS_API_KEY}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        return {
            statusCode: response.status,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" // Permite que seu frontend acesse
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error("Erro na Netlify Function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Erro ao buscar notícias." })
        };
    }
};