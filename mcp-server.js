#!/usr/bin/env node

/**
 * GERADOR DE PROPOSTAS MCP SERVER
 * Sistema MCP para automação do ciclo comercial
 * 
 * Como usar:
 * 1. npm install @modelcontextprotocol/sdk
 * 2. node mcp-server.js
 * 3. Configure no Cursor: Settings → MCP → Add Server
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';

// Database simples em JSON
const DB_PATH = './geradordepropostamcp-db.json';

// Inicializar banco de dados se não existir
async function initDatabase() {
  try {
    await fs.access(DB_PATH);
  } catch {
    const initialData = {
      clients: [],
      proposals: [],
      calls: [],
      emails: [],
      lastId: 0
    };
    await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2));
  }
}

// Ler dados do banco
async function readDatabase() {
  const data = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

// Escrever dados no banco
async function writeDatabase(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

// Gerar ID único
function generateId(db) {
  db.lastId += 1;
  return db.lastId;
}

// Servidor MCP
const server = new Server(
  {
    name: 'geradordepropostamcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Listar ferramentas disponíveis
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'add_client',
        description: 'Adicionar novo cliente/lead ao sistema',
        inputSchema: {
          type: 'object',
          properties: {
            companyName: {
              type: 'string',
              description: 'Nome da empresa'
            },
            segment: {
              type: 'string',
              enum: ['super-apps', 'otas', 'wholesalers', 'gds'],
              description: 'Segmento do cliente'
            },
            contactName: {
              type: 'string',
              description: 'Nome do contato principal'
            },
            contactRole: {
              type: 'string',
              description: 'Cargo do contato'
            },
            email: {
              type: 'string',
              description: 'E-mail do contato'
            },
            phone: {
              type: 'string',
              description: 'Telefone do contato'
            },
            monthlyVolume: {
              type: 'number',
              description: 'Volume mensal de transações'
            },
            region: {
              type: 'string',
              enum: ['apac', 'europe', 'americas', 'global'],
              description: 'Região principal'
            },
            status: {
              type: 'string',
              enum: ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'],
              description: 'Status do lead'
            }
          },
          required: ['companyName', 'segment', 'contactName', 'contactRole', 'email']
        }
      },
      {
        name: 'get_clients',
        description: 'Listar clientes/leads com filtros opcionais',
        inputSchema: {
          type: 'object',
          properties: {
            segment: {
              type: 'string',
              enum: ['super-apps', 'otas', 'wholesalers', 'gds'],
              description: 'Filtrar por segmento'
            },
            status: {
              type: 'string',
              enum: ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'],
              description: 'Filtrar por status'
            },
            region: {
              type: 'string',
              enum: ['apac', 'europe', 'americas', 'global'],
              description: 'Filtrar por região'
            }
          }
        }
      },
      {
        name: 'update_client_status',
        description: 'Atualizar status de um cliente',
        inputSchema: {
          type: 'object',
          properties: {
            clientId: {
              type: 'number',
              description: 'ID do cliente'
            },
            status: {
              type: 'string',
              enum: ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'],
              description: 'Novo status'
            },
            notes: {
              type: 'string',
              description: 'Notas sobre a mudança de status'
            }
          },
          required: ['clientId', 'status']
        }
      },
      {
        name: 'generate_proposal',
        description: 'Gerar proposta HTML personalizada para um cliente',
        inputSchema: {
          type: 'object',
          properties: {
            clientId: {
              type: 'number',
              description: 'ID do cliente'
            },
            plan: {
              type: 'string',
              enum: ['starter', 'professional', 'enterprise'],
              description: 'Plano escolhido'
            },
            discount: {
              type: 'number',
              description: 'Desconto em percentual (0-50)',
              minimum: 0,
              maximum: 50
            },
            validity: {
              type: 'number',
              description: 'Validade da proposta em dias',
              enum: [30, 60, 90]
            },
            notes: {
              type: 'string',
              description: 'Observações especiais'
            }
          },
          required: ['clientId', 'plan']
        }
      },
      {
        name: 'get_sdr_guidelines',
        description: 'Obter guidelines para call de SDR baseado no cliente',
        inputSchema: {
          type: 'object',
          properties: {
            clientId: {
              type: 'number',
              description: 'ID do cliente'
            },
            callType: {
              type: 'string',
              enum: ['cold-call', 'follow-up', 'qualification', 'demo', 'closing'],
              description: 'Tipo de call'
            }
          },
          required: ['clientId', 'callType']
        }
      },
      {
        name: 'generate_email_template',
        description: 'Gerar template de e-mail personalizado',
        inputSchema: {
          type: 'object',
          properties: {
            clientId: {
              type: 'number',
              description: 'ID do cliente'
            },
            emailType: {
              type: 'string',
              enum: ['intro', 'follow-up', 'proposal-sent', 'demo-invite', 'closing'],
              description: 'Tipo de e-mail'
            },
            customMessage: {
              type: 'string',
              description: 'Mensagem personalizada adicional'
            }
          },
          required: ['clientId', 'emailType']
        }
      },
      {
        name: 'get_sales_metrics',
        description: 'Obter métricas de vendas e performance',
        inputSchema: {
          type: 'object',
          properties: {
            period: {
              type: 'string',
              enum: ['week', 'month', 'quarter', 'year'],
              description: 'Período das métricas'
            },
            segment: {
              type: 'string',
              enum: ['super-apps', 'otas', 'wholesalers', 'gds', 'all'],
              description: 'Segmento para filtrar'
            }
          }
        }
      },
      {
        name: 'schedule_follow_up',
        description: 'Agendar follow-up para um cliente',
        inputSchema: {
          type: 'object',
          properties: {
            clientId: {
              type: 'number',
              description: 'ID do cliente'
            },
            followUpType: {
              type: 'string',
              enum: ['call', 'email', 'demo', 'proposal'],
              description: 'Tipo de follow-up'
            },
            daysFromNow: {
              type: 'number',
              description: 'Dias a partir de hoje para o follow-up',
              minimum: 1,
              maximum: 90
            },
            notes: {
              type: 'string',
              description: 'Notas sobre o follow-up'
            }
          },
          required: ['clientId', 'followUpType', 'daysFromNow']
        }
      }
    ]
  };
});

// Processar chamadas de ferramentas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    await initDatabase();
    const db = await readDatabase();

    switch (name) {
      case 'add_client': {
        const client = {
          id: generateId(db),
          ...args,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        db.clients.push(client);
        await writeDatabase(db);
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Cliente adicionado com sucesso!\n\n` +
                    `ID: ${client.id}\n` +
                    `Empresa: ${client.companyName}\n` +
                    `Segmento: ${client.segment}\n` +
                    `Contato: ${client.contactName} (${client.contactRole})\n` +
                    `Status: ${client.status}\n` +
                    `Região: ${client.region}`
            }
          ]
        };
      }

      case 'get_clients': {
        let clients = db.clients;
        
        // Aplicar filtros
        if (args.segment) {
          clients = clients.filter(c => c.segment === args.segment);
        }
        if (args.status) {
          clients = clients.filter(c => c.status === args.status);
        }
        if (args.region) {
          clients = clients.filter(c => c.region === args.region);
        }
        
        if (clients.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'Nenhum cliente encontrado com os filtros aplicados.'
              }
            ]
          };
        }
        
        const clientsText = clients.map(client => 
          `ID: ${client.id} | ${client.companyName} | ${client.segment} | ${client.status} | ${client.contactName}`
        ).join('\n');
        
        return {
          content: [
            {
              type: 'text',
              text: `📊 Clientes encontrados (${clients.length}):\n\n${clientsText}`
            }
          ]
        };
      }

      case 'update_client_status': {
        const client = db.clients.find(c => c.id === args.clientId);
        if (!client) {
          return {
            content: [
              {
                type: 'text',
                text: '❌ Cliente não encontrado.'
              }
            ]
          };
        }
        
        const oldStatus = client.status;
        client.status = args.status;
        client.updatedAt = new Date().toISOString();
        
        if (args.notes) {
          client.notes = args.notes;
        }
        
        await writeDatabase(db);
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Status atualizado!\n\n` +
                    `Cliente: ${client.companyName}\n` +
                    `Status anterior: ${oldStatus}\n` +
                    `Novo status: ${args.status}\n` +
                    `Atualizado em: ${client.updatedAt}`
            }
          ]
        };
      }

      case 'generate_proposal': {
        const client = db.clients.find(c => c.id === args.clientId);
        if (!client) {
          return {
            content: [
              {
                type: 'text',
                text: '❌ Cliente não encontrado.'
              }
            ]
          };
        }
        
        // Dados dos planos
        const planData = {
          starter: { name: 'STARTER', price: 2500, description: 'Para OTAs e Wholesalers' },
          professional: { name: 'PROFESSIONAL', price: 7500, description: 'Para OTAs Globais' },
          enterprise: { name: 'ENTERPRISE', price: 25000, description: 'Para Super Apps' }
        };
        
        const plan = planData[args.plan];
        const finalPrice = plan.price * (1 - (args.discount || 0) / 100);
        
        // Salvar proposta no banco
        const proposal = {
          id: generateId(db),
          clientId: args.clientId,
          plan: args.plan,
          price: finalPrice,
          discount: args.discount || 0,
          validity: args.validity || 30,
          notes: args.notes || '',
          createdAt: new Date().toISOString()
        };
        
        db.proposals.push(proposal);
        await writeDatabase(db);
        
        return {
          content: [
            {
              type: 'text',
              text: `📄 Proposta gerada com sucesso!\n\n` +
                    `Cliente: ${client.companyName}\n` +
                    `Plano: ${plan.name}\n` +
                    `Preço: €${finalPrice.toLocaleString()}/mês\n` +
                    `Desconto: ${args.discount || 0}%\n` +
                    `Validade: ${args.validity || 30} dias\n` +
                    `Proposta ID: ${proposal.id}\n\n` +
                    `💡 Use o gerador HTML para criar o arquivo da proposta!`
            }
          ]
        };
      }

      case 'get_sdr_guidelines': {
        const client = db.clients.find(c => c.id === args.clientId);
        if (!client) {
          return {
            content: [
              {
                type: 'text',
                text: '❌ Cliente não encontrado.'
              }
            ]
          };
        }
        
        // Guidelines por segmento e tipo de call
        const guidelines = {
          'super-apps': {
            'cold-call': [
              'Foque na visão MaaS (Mobility as a Service)',
              'Mencione TTFT < 90 dias como diferencial',
              'Destaque o potencial de crescimento de 15%+ na receita',
              'Fale sobre simplificação operacional completa'
            ],
            'follow-up': [
              'Relembre o potencial de mercado APAC ($337B)',
              'Mencione casos de sucesso similares',
              'Proponha POC de 30 dias',
              'Destaque suporte dedicado 24/7'
            ]
          },
          'otas': {
            'cold-call': [
              'Foque na transformação de custo em centro de lucro',
              'Mencione otimização de ARPR',
              'Destaque redução de 70% no tempo de integração',
              'Fale sobre consolidação financeira'
            ],
            'follow-up': [
              'Relembre a dívida técnica atual',
              'Mencione ROI em 6 meses',
              'Proponha POC de 90 dias',
              'Destaque analytics avançados'
            ]
          }
        };
        
        const segmentGuidelines = guidelines[client.segment] || guidelines['otas'];
        const callGuidelines = segmentGuidelines[args.callType] || segmentGuidelines['cold-call'];
        
        return {
          content: [
            {
              type: 'text',
              text: `📞 Guidelines para Call - ${client.companyName}\n\n` +
                    `Tipo: ${args.callType}\n` +
                    `Segmento: ${client.segment}\n\n` +
                    `🎯 Pontos-chave:\n` +
                    callGuidelines.map(g => `• ${g}`).join('\n') + '\n\n' +
                    `📋 Informações do cliente:\n` +
                    `• Contato: ${client.contactName} (${client.contactRole})\n` +
                    `• Volume: ${client.monthlyVolume || 'N/A'} transações/mês\n` +
                    `• Região: ${client.region}\n` +
                    `• Status: ${client.status}`
            }
          ]
        };
      }

      case 'generate_email_template': {
        const client = db.clients.find(c => c.id === args.clientId);
        if (!client) {
          return {
            content: [
              {
                type: 'text',
                text: '❌ Cliente não encontrado.'
              }
            ]
          };
        }
        
        // Templates de e-mail por tipo
        const emailTemplates = {
          'intro': {
            subject: `Distribusion - Transformando ${client.companyName} em centro de lucro`,
            body: `Olá ${client.contactName},\n\n` +
                  `Sou [SEU NOME] da Distribusion e gostaria de apresentar como podemos transformar o transporte terrestre da ${client.companyName} de custo operacional em centro de lucro.\n\n` +
                  `Com nossa plataforma, empresas como a ${client.companyName} conseguem:\n` +
                  `• Aumentar receita por passageiro em 15%+\n` +
                  `• Reduzir tempo de integração em 70%\n` +
                  `• Simplificar operações com "One Contract, One Settlement"\n\n` +
                  `Gostaria de agendar uma breve conversa de 15 minutos para mostrar como isso se aplica especificamente ao seu caso?\n\n` +
                  `Atenciosamente,\n[SEU NOME]`
          },
          'follow-up': {
            subject: `Seguindo sobre nossa conversa - ${client.companyName}`,
            body: `Olá ${client.contactName},\n\n` +
                  `Espero que esteja bem! Seguindo nossa conversa anterior sobre como a Distribusion pode ajudar a ${client.companyName} a otimizar suas operações de transporte terrestre.\n\n` +
                  `Gostaria de agendar uma demonstração personalizada para mostrar exatamente como nossa solução se encaixa nas necessidades da ${client.companyName}?\n\n` +
                  `Atenciosamente,\n[SEU NOME]`
          }
        };
        
        const template = emailTemplates[args.emailType] || emailTemplates['intro'];
        
        return {
          content: [
            {
              type: 'text',
              text: `📧 Template de E-mail - ${client.companyName}\n\n` +
                    `Tipo: ${args.emailType}\n` +
                    `Para: ${client.contactName} <${client.email}>\n\n` +
                    `Assunto: ${template.subject}\n\n` +
                    `Corpo:\n${template.body}\n\n` +
                    `${args.customMessage ? `Mensagem personalizada: ${args.customMessage}\n\n` : ''}` +
                    `💡 Copie e cole no seu cliente de e-mail!`
            }
          ]
        };
      }

      case 'get_sales_metrics': {
        const period = args.period || 'month';
        const segment = args.segment || 'all';
        
        let clients = db.clients;
        if (segment !== 'all') {
          clients = clients.filter(c => c.segment === segment);
        }
        
        // Calcular métricas
        const totalClients = clients.length;
        const leads = clients.filter(c => c.status === 'lead').length;
        const qualified = clients.filter(c => c.status === 'qualified').length;
        const proposals = clients.filter(c => c.status === 'proposal').length;
        const won = clients.filter(c => c.status === 'closed-won').length;
        const lost = clients.filter(c => c.status === 'closed-lost').length;
        
        const conversionRate = totalClients > 0 ? ((won / totalClients) * 100).toFixed(1) : 0;
        
        return {
          content: [
            {
              type: 'text',
              text: `📊 Métricas de Vendas - ${period.toUpperCase()}\n\n` +
                    `Segmento: ${segment === 'all' ? 'Todos' : segment}\n` +
                    `Período: ${period}\n\n` +
                    `📈 Números:\n` +
                    `• Total de clientes: ${totalClients}\n` +
                    `• Leads: ${leads}\n` +
                    `• Qualificados: ${qualified}\n` +
                    `• Propostas: ${proposals}\n` +
                    `• Fechados (Ganhos): ${won}\n` +
                    `• Fechados (Perdidos): ${lost}\n\n` +
                    `🎯 Taxa de conversão: ${conversionRate}%\n\n` +
                    `💡 Use update_client_status para atualizar status e melhorar métricas!`
            }
          ]
        };
      }

      case 'schedule_follow_up': {
        const client = db.clients.find(c => c.id === args.clientId);
        if (!client) {
          return {
            content: [
              {
                type: 'text',
                text: '❌ Cliente não encontrado.'
              }
            ]
          };
        }
        
        const followUpDate = new Date();
        followUpDate.setDate(followUpDate.getDate() + args.daysFromNow);
        
        const followUp = {
          id: generateId(db),
          clientId: args.clientId,
          type: args.followUpType,
          scheduledDate: followUpDate.toISOString(),
          notes: args.notes || '',
          status: 'scheduled',
          createdAt: new Date().toISOString()
        };
        
        db.emails.push(followUp);
        await writeDatabase(db);
        
        return {
          content: [
            {
              type: 'text',
              text: `📅 Follow-up agendado!\n\n` +
                    `Cliente: ${client.companyName}\n` +
                    `Tipo: ${args.followUpType}\n` +
                    `Data: ${followUpDate.toLocaleDateString('pt-BR')}\n` +
                    `Notas: ${args.notes || 'Nenhuma'}\n` +
                    `ID: ${followUp.id}\n\n` +
                    `💡 Lembre-se de executar o follow-up na data agendada!`
            }
          ]
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: `❌ Ferramenta '${name}' não encontrada.`
            }
          ]
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Erro: ${error.message}`
        }
      ]
    };
  }
});

// Iniciar servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🚀 Gerador de Propostas MCP Server iniciado!');
}

main().catch(console.error);
