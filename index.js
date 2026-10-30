export default async function handler(req, res) {
  try {
    const figmaToken = process.env.FIGMA_ACCESS_TOKEN;

    if (!figmaToken) {
      return res.status(500).json({ 
        error: 'FIGMA_ACCESS_TOKEN no configurado en Vercel.' 
      });
    }

    // Encabezados necesarios para conexiones SSE/HTTP de Claude MCP
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'GET') {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      return res.status(200).send('data: {"status": "Servidor MCP de Figma listo"}\n\n');
    }

    return res.status(200).json({ status: 'Servidor MCP de Figma activo' });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Error en la invocación del servidor', 
      details: error.message 
    });
  }
}