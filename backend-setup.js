// 🚀 BACKEND SETUP - Sistema de Geração de Propostas
// Este arquivo mostra como configurar o backend Node.js

const express = require('express');
const multer = require('multer');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'propostas_db',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

// Configuração OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Configuração de upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// ==================== ROTAS DE AUTENTICAÇÃO ====================

// Registro de usuário
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Verificar se usuário já existe
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Usuário já existe' });
        }

        // Hash da senha
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Criar usuário
        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hashedPassword]
        );

        const user = result.rows[0];
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({ user, token });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Login de usuário
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuário
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const user = result.rows[0];

        // Verificar senha
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Gerar token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            user: { id: user.id, name: user.name, email: user.email },
            token
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ==================== ROTAS DE REUNIÕES ====================

// Upload de áudio para transcrição
app.post('/api/meetings/upload', authenticateToken, upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }

        const audioPath = req.file.path;
        const userId = req.user.userId;

        // Transcrever áudio usando OpenAI Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(audioPath),
            model: "whisper-1",
            language: "pt"
        });

        // Extrair informações usando GPT-4
        const extractionPrompt = `
        Analise esta transcrição de reunião comercial e extraia as seguintes informações:
        
        Transcrição: ${transcription.text}
        
        Extraia:
        1. Nome da empresa do cliente
        2. Nome do contato principal
        3. Cargo do contato
        4. Volume mensal de transações
        5. Região principal
        6. Dores/desafios mencionados
        7. Requisitos específicos
        8. Segmento de mercado
        
        Retorne em formato JSON.
        `;

        const extractionResponse = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: extractionPrompt }],
            temperature: 0.3
        });

        const extractedData = JSON.parse(extractionResponse.choices[0].message.content);

        // Salvar no banco de dados
        const result = await pool.query(
            'INSERT INTO meetings (user_id, audio_file_path, transcription, extracted_data) VALUES ($1, $2, $3, $4) RETURNING id',
            [userId, audioPath, transcription.text, JSON.stringify(extractedData)]
        );

        res.json({
            meetingId: result.rows[0].id,
            transcription: transcription.text,
            extractedData: extractedData
        });

    } catch (error) {
        console.error('Erro no upload:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar reunião por ID
app.get('/api/meetings/:id', authenticateToken, async (req, res) => {
    try {
        const meetingId = req.params.id;
        const userId = req.user.userId;

        const result = await pool.query(
            'SELECT * FROM meetings WHERE id = $1 AND user_id = $2',
            [meetingId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Reunião não encontrada' });
        }

        const meeting = result.rows[0];
        res.json({
            id: meeting.id,
            transcription: meeting.transcription,
            extractedData: meeting.extracted_data,
            createdAt: meeting.created_at
        });

    } catch (error) {
        console.error('Erro ao buscar reunião:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ==================== ROTAS DE PROPOSTAS ====================

// Gerar proposta
app.post('/api/proposals/generate', authenticateToken, async (req, res) => {
    try {
        const { meetingId, clientData, plan, customizations } = req.body;
        const userId = req.user.userId;

        // Buscar dados da reunião
        const meetingResult = await pool.query(
            'SELECT * FROM meetings WHERE id = $1 AND user_id = $2',
            [meetingId, userId]
        );

        if (meetingResult.rows.length === 0) {
            return res.status(404).json({ error: 'Reunião não encontrada' });
        }

        const meeting = meetingResult.rows[0];
        const extractedData = meeting.extracted_data;

        // Gerar proposta usando GPT-4
        const proposalPrompt = `
        Gere uma proposta comercial profissional baseada nos seguintes dados:
        
        Cliente: ${clientData.companyName || extractedData.companyName}
        Contato: ${clientData.contactName || extractedData.contactName}
        Cargo: ${clientData.contactRole || extractedData.contactRole}
        Volume: ${clientData.monthlyVolume || extractedData.monthlyVolume}
        Região: ${clientData.region || extractedData.region}
        Plano: ${plan}
        Dores: ${extractedData.painPoints?.join(', ') || 'Não especificadas'}
        Requisitos: ${extractedData.requirements?.join(', ') || 'Não especificados'}
        
        Gere uma proposta em HTML formatada e profissional.
        `;

        const proposalResponse = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: proposalPrompt }],
            temperature: 0.7
        });

        const proposalHtml = proposalResponse.choices[0].message.content;

        // Salvar proposta no banco
        const result = await pool.query(
            'INSERT INTO proposals (meeting_id, client_data, proposal_html, status) VALUES ($1, $2, $3, $4) RETURNING id',
            [meetingId, JSON.stringify(clientData), proposalHtml, 'generated']
        );

        res.json({
            proposalId: result.rows[0].id,
            proposalHtml: proposalHtml
        });

    } catch (error) {
        console.error('Erro ao gerar proposta:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ==================== ROTAS DE IMAGENS ====================

// Upload de imagem
app.post('/api/images/upload', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }

        const { category, description, tags } = req.body;
        const userId = req.user.userId;
        const imagePath = req.file.path;

        // Salvar no banco de dados
        const result = await pool.query(
            'INSERT INTO images (user_id, file_path, category, description, tags) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [userId, imagePath, category, description, tags]
        );

        res.json({
            imageId: result.rows[0].id,
            imagePath: imagePath,
            category: category
        });

    } catch (error) {
        console.error('Erro no upload de imagem:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ==================== ROTAS DE DASHBOARD ====================

// Estatísticas do usuário
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Contar reuniões
        const meetingsResult = await pool.query(
            'SELECT COUNT(*) as total FROM meetings WHERE user_id = $1',
            [userId]
        );

        // Contar propostas
        const proposalsResult = await pool.query(
            'SELECT COUNT(*) as total FROM proposals WHERE meeting_id IN (SELECT id FROM meetings WHERE user_id = $1)',
            [userId]
        );

        // Propostas por status
        const statusResult = await pool.query(
            'SELECT status, COUNT(*) as count FROM proposals WHERE meeting_id IN (SELECT id FROM meetings WHERE user_id = $1) GROUP BY status',
            [userId]
        );

        res.json({
            totalMeetings: parseInt(meetingsResult.rows[0].total),
            totalProposals: parseInt(proposalsResult.rows[0].total),
            proposalsByStatus: statusResult.rows
        });

    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ==================== INICIALIZAÇÃO ====================

// Criar tabelas se não existirem
async function initializeDatabase() {
    try {
        // Tabela de usuários
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Tabela de reuniões
        await pool.query(`
            CREATE TABLE IF NOT EXISTS meetings (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                audio_file_path VARCHAR(255),
                transcription TEXT,
                extracted_data JSONB,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Tabela de propostas
        await pool.query(`
            CREATE TABLE IF NOT EXISTS proposals (
                id SERIAL PRIMARY KEY,
                meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
                client_data JSONB,
                proposal_html TEXT,
                pdf_path VARCHAR(255),
                status VARCHAR(50) DEFAULT 'draft',
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Tabela de imagens
        await pool.query(`
            CREATE TABLE IF NOT EXISTS images (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                file_path VARCHAR(255) NOT NULL,
                category VARCHAR(50),
                description TEXT,
                tags TEXT[],
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        console.log('✅ Banco de dados inicializado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao inicializar banco de dados:', error);
    }
}

// Iniciar servidor
app.listen(port, async () => {
    await initializeDatabase();
    console.log(`🚀 Servidor rodando na porta ${port}`);
    console.log(`📊 Dashboard: http://localhost:${port}`);
    console.log(`🔧 API: http://localhost:${port}/api`);
});

module.exports = app;
