const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Dados da Factorial (MCP - Model Context Protocol)
const factorialData = {
  plans: {
    starter: {
      name: "STARTER",
      price: 2.50,
      description: "Para pequenas empresas",
      features: [
        "Até 50 funcionários",
        "Gestão de RH básica",
        "Controle de ponto",
        "Relatórios básicos",
        "Suporte por email",
        "Setup e onboarding incluído"
      ],
      target: "Pequenas Empresas"
    },
    professional: {
      name: "PROFESSIONAL", 
      price: 3.50,
      description: "Para empresas em crescimento",
      features: [
        "Até 200 funcionários",
        "Gestão de RH completa",
        "Controle de ponto avançado",
        "Relatórios avançados",
        "Integrações",
        "Suporte prioritário",
        "Consultoria de implementação"
      ],
      target: "Empresas em Crescimento"
    },
    enterprise: {
      name: "ENTERPRISE",
      price: 4.50,
      description: "Para grandes empresas",
      features: [
        "Funcionários ilimitados",
        "Gestão de RH completa",
        "Controle de ponto avançado",
        "Relatórios personalizados",
        "Integrações ilimitadas",
        "Suporte dedicado",
        "Account Manager",
        "SLA garantido 99.9%"
      ],
      target: "Grandes Empresas"
    }
  },
  segments: {
    "startups": {
      name: "Startups (1-50 funcionários)",
      valueProp: "Simplifique a gestão de RH desde o início com uma solução completa e escalável",
      painPoints: [
        "Processos manuais de RH consomem muito tempo",
        "Falta de visibilidade sobre performance da equipe",
        "Dificuldade para controlar custos de folha de pagamento"
      ],
      benefits: [
        "Automação de 80% dos processos de RH",
        "Economia de 10h/semana em tarefas administrativas",
        "Controle total sobre custos e performance"
      ]
    },
    "pequenas": {
      name: "Pequenas Empresas (51-200 funcionários)",
      valueProp: "Escale sua gestão de RH com processos automatizados e relatórios avançados",
      painPoints: [
        "Crescimento rápido sem estrutura de RH adequada",
        "Compliance e legalidade complexos",
        "Falta de dados para tomada de decisão"
      ],
      benefits: [
        "Compliance automático com legislação",
        "Relatórios em tempo real para decisões estratégicas",
        "Redução de 60% no tempo de processos"
      ]
    },
    "medias": {
      name: "Médias Empresas (201-1000 funcionários)",
      valueProp: "Otimize operações de RH com integrações avançadas e analytics",
      painPoints: [
        "Múltiplos sistemas desconectados",
        "Falta de visibilidade entre departamentos",
        "Custos operacionais elevados"
      ],
      benefits: [
        "Integração completa com sistemas existentes",
        "Visibilidade 360° da organização",
        "Redução de 40% nos custos operacionais"
      ]
    },
    "grandes": {
      name: "Grandes Empresas (1000+ funcionários)",
      valueProp: "Transforme RH em centro estratégico com IA e analytics avançados",
      painPoints: [
        "Complexidade operacional extrema",
        "Falta de insights estratégicos",
        "Necessidade de personalização"
      ],
      benefits: [
        "IA para insights estratégicos",
        "Personalização completa",
        "ROI de 300%+ em 12 meses"
      ]
    }
  }
};

// API Routes

// 1. Obter dados dos planos
app.get('/api/plans', (req, res) => {
  res.json(factorialData.plans);
});

// 2. Obter dados dos segmentos
app.get('/api/segments', (req, res) => {
  res.json(factorialData.segments);
});

// 3. Calcular preço da proposta
app.post('/api/calculate-price', (req, res) => {
  const { plan, employeeCount, discount = 0 } = req.body;
  
  if (!factorialData.plans[plan]) {
    return res.status(400).json({ error: 'Plano inválido' });
  }
  
  const planData = factorialData.plans[plan];
  const basePrice = planData.price;
  const finalPrice = basePrice * (1 - discount / 100);
  const totalMonthly = finalPrice * employeeCount;
  
  res.json({
    plan: planData,
    basePrice,
    finalPrice,
    totalMonthly,
    employeeCount,
    discount
  });
});

// 4. Gerar proposta HTML
app.post('/api/generate-proposal', (req, res) => {
  const { 
    companyName, 
    segment, 
    contactName, 
    contactRole, 
    employeeCount, 
    region, 
    plan, 
    validity, 
    discount, 
    notes, 
    startDate 
  } = req.body;
  
  const planData = factorialData.plans[plan];
  const segmentData = factorialData.segments[segment];
  const finalPrice = planData.price * (1 - discount / 100);
  const totalMonthly = finalPrice * employeeCount;
  
  const proposalHTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proposta Comercial Factorial - ${companyName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .factorial-brand { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    </style>
</head>
<body class="bg-gray-50">
    <div class="max-w-4xl mx-auto bg-white shadow-lg">
        <!-- Header -->
        <div class="factorial-brand text-white p-8">
            <h1 class="text-4xl font-bold mb-2">FACTORIAL</h1>
            <h2 class="text-2xl font-light">Proposta Comercial</h2>
            <p class="text-purple-100 mt-2">${companyName} - ${segmentData.name}</p>
        </div>

        <!-- Dados do Cliente -->
        <div class="p-8 border-b">
            <h3 class="text-2xl font-semibold mb-4 text-gray-800">📋 Informações do Cliente</h3>
            <div class="grid grid-cols-2 gap-4 text-gray-700">
                <div><strong>Empresa:</strong> ${companyName}</div>
                <div><strong>Segmento:</strong> ${segmentData.name}</div>
                <div><strong>Contato:</strong> ${contactName}</div>
                <div><strong>Cargo:</strong> ${contactRole}</div>
                <div><strong>Funcionários:</strong> ${employeeCount}</div>
                <div><strong>Região:</strong> ${region.toUpperCase()}</div>
            </div>
        </div>

        <!-- Proposta de Valor -->
        <div class="p-8 border-b">
            <h3 class="text-2xl font-semibold mb-4 text-gray-800">🎯 Nossa Proposta de Valor</h3>
            <p class="text-lg text-gray-700 mb-6">${segmentData.valueProp}</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 class="text-lg font-semibold text-red-600 mb-3">❌ Desafios Atuais</h4>
                    <ul class="space-y-2 text-gray-700">
                        ${segmentData.painPoints.map(point => `<li>• ${point}</li>`).join('')}
                    </ul>
                </div>
                <div>
                    <h4 class="text-lg font-semibold text-green-600 mb-3">✅ Benefícios com Factorial</h4>
                    <ul class="space-y-2 text-gray-700">
                        ${segmentData.benefits.map(benefit => `<li>• ${benefit}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>

        <!-- Plano Escolhido -->
        <div class="p-8 border-b">
            <h3 class="text-2xl font-semibold mb-4 text-gray-800">📦 Plano ${planData.name}</h3>
            <div class="bg-purple-50 p-6 rounded-lg">
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <h4 class="text-xl font-bold text-gray-800">${planData.name}</h4>
                        <p class="text-gray-600">${planData.description}</p>
                    </div>
                    <div class="text-right">
                        ${discount > 0 ? `
                            <div class="text-sm text-gray-500 line-through">€${planData.price.toFixed(2)}/funcionário/mês</div>
                            <div class="text-3xl font-bold text-purple-600">€${finalPrice.toFixed(2)}/funcionário/mês</div>
                            <div class="text-sm text-green-600">${discount}% de desconto</div>
                        ` : `
                            <div class="text-3xl font-bold text-purple-600">€${planData.price.toFixed(2)}/funcionário/mês</div>
                        `}
                        <div class="text-lg font-semibold text-gray-800 mt-2">
                            Total: €${totalMonthly.toFixed(2)}/mês
                        </div>
                    </div>
                </div>
                
                <h5 class="font-semibold text-gray-800 mb-3">Incluído no plano:</h5>
                <ul class="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700">
                    ${planData.features.map(feature => `<li>✓ ${feature}</li>`).join('')}
                </ul>
            </div>
        </div>

        <!-- Cronograma de Implementação -->
        <div class="p-8 border-b">
            <h3 class="text-2xl font-semibold mb-4 text-gray-800">📅 Cronograma de Implementação</h3>
            <div class="grid grid-cols-4 gap-4">
                <div class="text-center p-4 bg-purple-50 rounded-lg">
                    <div class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span class="text-white font-bold">1</span>
                    </div>
                    <h4 class="font-semibold text-purple-800">Semana 1</h4>
                    <p class="text-sm text-gray-600">Setup e Configuração</p>
                </div>
                <div class="text-center p-4 bg-green-50 rounded-lg">
                    <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span class="text-white font-bold">2</span>
                    </div>
                    <h4 class="font-semibold text-green-800">Semana 2</h4>
                    <p class="text-sm text-gray-600">Migração de Dados</p>
                </div>
                <div class="text-center p-4 bg-yellow-50 rounded-lg">
                    <div class="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span class="text-white font-bold">3</span>
                    </div>
                    <h4 class="font-semibold text-yellow-800">Semana 3</h4>
                    <p class="text-sm text-gray-600">Treinamento da Equipe</p>
                </div>
                <div class="text-center p-4 bg-blue-50 rounded-lg">
                    <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span class="text-white font-bold">4</span>
                    </div>
                    <h4 class="font-semibold text-blue-800">Semana 4</h4>
                    <p class="text-sm text-gray-600">Go-Live</p>
                </div>
            </div>
        </div>

        <!-- Termos e Condições -->
        <div class="p-8 border-b">
            <h3 class="text-2xl font-semibold mb-4 text-gray-800">📋 Termos e Condições</h3>
            <div class="grid grid-cols-2 gap-6 text-gray-700">
                <div>
                    <h4 class="font-semibold mb-2">Validade da Proposta</h4>
                    <p>${validity} dias a partir da data de envio</p>
                </div>
                <div>
                    <h4 class="font-semibold mb-2">Data de Início</h4>
                    <p>${new Date(startDate).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                    <h4 class="font-semibold mb-2">Forma de Pagamento</h4>
                    <p>Mensal, antecipado</p>
                </div>
                <div>
                    <h4 class="font-semibold mb-2">Contrato</h4>
                    <p>Mínimo 12 meses</p>
                </div>
            </div>
        </div>

        <!-- Observações -->
        ${notes ? `
        <div class="p-8 border-b">
            <h3 class="text-2xl font-semibold mb-4 text-gray-800">📝 Observações Especiais</h3>
            <p class="text-gray-700">${notes}</p>
        </div>
        ` : ''}

        <!-- Call to Action -->
        <div class="p-8 bg-gray-50">
            <h3 class="text-2xl font-semibold mb-4 text-gray-800">🚀 Próximos Passos</h3>
            <p class="text-gray-700 mb-6">Estamos prontos para transformar a gestão de RH da ${companyName} com a Factorial.</p>
            
            <div class="flex flex-col sm:flex-row gap-4">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-800 mb-2">Contato Comercial</h4>
                    <p class="text-gray-700">Seu Account Manager entrará em contato em até 24h para agendar uma reunião de alinhamento.</p>
                </div>
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-800 mb-2">Implementação Inclusa</h4>
                    <p class="text-gray-700">Iniciaremos a implementação em 4 semanas com suporte completo da nossa equipe.</p>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="p-8 factorial-brand text-white text-center">
            <h4 class="text-xl font-bold mb-2">FACTORIAL</h4>
            <p class="text-purple-100">Transformando a gestão de RH em empresas modernas</p>
            <p class="text-sm text-purple-200 mt-2">Proposta gerada em ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
    </div>
</body>
</html>`;
  
  res.json({ html: proposalHTML });
});

// 5. Processar transcrição
app.post('/api/process-transcription', (req, res) => {
  const { transcription } = req.body;
  
  // Simulação de processamento com IA
  const extractedData = {
    companyName: extractCompanyName(transcription),
    contactName: extractContactName(transcription),
    employeeCount: extractEmployeeCount(transcription),
    painPoints: extractPainPoints(transcription),
    requirements: extractRequirements(transcription),
    segment: determineSegment(transcription)
  };
  
  res.json(extractedData);
});

// Funções auxiliares para extração de dados
function extractCompanyName(text) {
  const patterns = [
    /empresa\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+é\s+uma/i,
    /trabalhamos\s+na\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  
  return "Empresa Cliente";
}

function extractContactName(text) {
  const patterns = [
    /meu\s+nome\s+é\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /sou\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s+responsável/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  
  return "Contato Cliente";
}

function extractEmployeeCount(text) {
  const patterns = [
    /(\d+)\s+funcionários/i,
    /(\d+)\s+colaboradores/i,
    /equipe\s+de\s+(\d+)/i,
    /(\d+)\s+pessoas/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return parseInt(match[1]);
  }
  
  return 50; // Default
}

function extractPainPoints(text) {
  const painPoints = [];
  const keywords = [
    'problema', 'dificuldade', 'desafio', 'dor', 'problemas',
    'lento', 'demorado', 'complicado', 'difícil', 'manual'
  ];
  
  const sentences = text.split(/[.!?]+/);
  
  sentences.forEach(sentence => {
    if (keywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
      painPoints.push(sentence.trim());
    }
  });
  
  return painPoints.slice(0, 3); // Máximo 3 dores
}

function extractRequirements(text) {
  const requirements = [];
  const keywords = [
    'precisamos', 'queremos', 'necessitamos', 'requisito',
    'funcionalidade', 'feature', 'integração', 'relatório'
  ];
  
  const sentences = text.split(/[.!?]+/);
  
  sentences.forEach(sentence => {
    if (keywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
      requirements.push(sentence.trim());
    }
  });
  
  return requirements.slice(0, 3); // Máximo 3 requisitos
}

function determineSegment(text) {
  const employeeCount = extractEmployeeCount(text);
  
  if (employeeCount <= 50) return 'startups';
  if (employeeCount <= 200) return 'pequenas';
  if (employeeCount <= 1000) return 'medias';
  return 'grandes';
}

// Servir arquivos estáticos
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/proposal-generator', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'proposal-generator.html'));
});

app.get('/meeting-transcriber', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'meeting-transcriber.html'));
});

app.get('/image-manager', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'image-manager.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Factorial rodando na porta ${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
  console.log(`🔧 APIs disponíveis:`);
  console.log(`   - GET  /api/plans`);
  console.log(`   - GET  /api/segments`);
  console.log(`   - POST /api/calculate-price`);
  console.log(`   - POST /api/generate-proposal`);
  console.log(`   - POST /api/process-transcription`);
});

module.exports = app;