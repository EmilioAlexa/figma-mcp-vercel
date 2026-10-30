import { createServer } from '@modelcontextprotocol/server-figma';

export default async function handler(req, res) {
  // Manejo de peticiones HTTP para el conector MCP
  const figmaToken = process.env.FIGMA_ACCESS_TOKEN;

  if (!figmaToken) {
    return res.status(500).json({ error: 'FIGMA_ACCESS_TOKEN no configurado.' });
  }

  // Respuestas necesarias para que Claude Web se comunique por HTTP/SSE
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    return res.status(200).send('endpoint: /api/index');
  }

  res.status(200).json({ status: 'Servidor MCP de Figma activo' });
}