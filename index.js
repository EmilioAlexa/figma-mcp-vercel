import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Inicializar el servidor MCP
const server = new Server(
  { name: 'figma-make-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// Registrar las herramientas que utilizará Claude
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_figma_file',
        description: 'Obtiene los datos y nodos de un proyecto de Figma/Figma Make',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: { type: 'string', description: 'La clave o ID del archivo de Figma' }
          },
          required: ['fileKey']
        }
      }
    ]
  };
});

// Manejar llamadas a las herramientas de Figma
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'get_figma_file') {
    const figmaToken = process.env.FIGMA_ACCESS_TOKEN;
    const fileKey = request.params.arguments?.fileKey;

    if (!figmaToken) {
      throw new Error('FIGMA_ACCESS_TOKEN no configurado en Vercel');
    }

    const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: { 'X-Figma-Token': figmaToken }
    });

    const data = await response.json();
    return {
      content: [{ type: 'text', text: JSON.stringify(data) }]
    };
  }

  throw new Error('Herramienta no encontrada');
});

export default async function handler(req, res) {
  // Manejo de encabezados CORS para habilitar la conexión desde Claude Web
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Respuesta exitosa a las peticiones POST y GET de Claude
  if (req.method === 'POST' || req.method === 'GET') {
    return res.status(200).json({
      jsonrpc: '2.0',
      status: 'active',
      server: 'figma-make-mcp',
      mcpVersion: '1.0.0'
    });
  }

  return res.status(200).json({ status: 'ready' });
}