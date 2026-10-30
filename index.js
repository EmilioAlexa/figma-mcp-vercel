import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'figma-make-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// Registrar la herramienta para leer Figma
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_figma_file',
        description: 'Obtiene los detalles y nodos de un archivo de Figma Make',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: { type: 'string', description: 'El ID del archivo de Figma' }
          },
          required: ['fileKey']
        }
      }
    ]
  };
});

// Manejar la llamada a la herramienta
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'get_figma_file') {
    const figmaToken = process.env.FIGMA_ACCESS_TOKEN;
    const fileKey = request.params.arguments?.fileKey;

    if (!figmaToken) {
      throw new Error('FIGMA_ACCESS_TOKEN no está configurado en Vercel.');
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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Inicializar transporte SSE
  if (req.method === 'GET') {
    const transport = new SSEServerTransport('/api/messages', res);
    await server.connect(transport);
    return;
  }

  return res.status(200).json({ status: 'MCP Server Ready' });
}