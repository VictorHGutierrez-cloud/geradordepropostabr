# 🚀 Guia de Deploy - Sistema Factorial

## 📋 **OPÇÕES DE DEPLOY**

### **Opção 1: Deploy Local (Recomendado para Testes)**
```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor
npm start

# 3. Acessar
http://localhost:3000
```

### **Opção 2: Deploy em Servidor (Produção)**

#### **2.1 Heroku (Gratuito)**
```bash
# 1. Instalar Heroku CLI
# 2. Login
heroku login

# 3. Criar app
heroku create factorial-proposal-generator

# 4. Deploy
git push heroku main

# 5. Acessar
https://factorial-proposal-generator.herokuapp.com
```

#### **2.2 Railway (Gratuito)**
```bash
# 1. Conectar repositório GitHub
# 2. Deploy automático
# 3. Acessar URL fornecida
```

#### **2.3 Render (Gratuito)**
```bash
# 1. Conectar repositório GitHub
# 2. Configurar build: npm install
# 3. Configurar start: npm start
# 4. Deploy automático
```

### **Opção 3: VPS/Servidor Próprio**

#### **3.1 Ubuntu/Debian**
```bash
# 1. Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Instalar PM2
sudo npm install -g pm2

# 3. Clonar repositório
git clone https://github.com/VictorHGutierrez-cloud/geradordepropostabr.git
cd geradordepropostabr

# 4. Instalar dependências
npm install

# 5. Iniciar com PM2
pm2 start server.js --name "factorial-proposal"
pm2 startup
pm2 save

# 6. Configurar Nginx (opcional)
sudo apt install nginx
# Configurar proxy para porta 3000
```

## 🔧 **CONFIGURAÇÕES NECESSÁRIAS**

### **Variáveis de Ambiente**
Criar arquivo `.env`:
```env
PORT=3000
NODE_ENV=production
```

### **Dependências do Sistema**
```bash
# Para Puppeteer (geração de PDF)
sudo apt-get update
sudo apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils
```

## 📱 **TESTANDO O SISTEMA**

### **1. Testar APIs**
```bash
# Testar planos
curl http://localhost:3000/api/plans

# Testar cálculo de preço
curl -X POST http://localhost:3000/api/calculate-price \
  -H "Content-Type: application/json" \
  -d '{"plan":"professional","employeeCount":100,"discount":10}'
```

### **2. Testar Frontend**
1. Acessar `http://localhost:3000`
2. Preencher formulário
3. Selecionar plano
4. Gerar proposta
5. Exportar PDF

## 🚨 **SOLUÇÃO DE PROBLEMAS**

### **Problema: Porta 3000 ocupada**
```bash
# Verificar processos
lsof -i :3000

# Matar processo
kill -9 PID

# Ou usar outra porta
PORT=3001 npm start
```

### **Problema: Puppeteer não funciona**
```bash
# Instalar dependências
sudo apt-get install -y chromium-browser

# Configurar variável
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### **Problema: CORS**
```bash
# Verificar se cors está instalado
npm list cors

# Se não estiver, instalar
npm install cors
```

## 📊 **MONITORAMENTO**

### **Logs**
```bash
# Ver logs em tempo real
pm2 logs factorial-proposal

# Ver status
pm2 status

# Reiniciar
pm2 restart factorial-proposal
```

### **Métricas**
- CPU: `pm2 monit`
- Memória: `pm2 monit`
- Uptime: `pm2 status`

## 🔒 **SEGURANÇA**

### **HTTPS**
```bash
# Instalar certificado SSL
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com
```

### **Firewall**
```bash
# Configurar UFW
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 📈 **ESCALABILIDADE**

### **Load Balancer**
```bash
# Instalar Nginx
sudo apt install nginx

# Configurar múltiplas instâncias
pm2 start server.js -i 4 --name "factorial-proposal"
```

### **Banco de Dados**
```bash
# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Configurar conexão
# Adicionar no .env:
DATABASE_URL=postgresql://user:password@localhost:5432/factorial
```

## 🎯 **PRÓXIMOS PASSOS**

1. **Escolher opção de deploy**
2. **Configurar servidor**
3. **Testar funcionalidades**
4. **Configurar domínio**
5. **Monitorar performance**

---

**Recomendação:** Começar com deploy local para testes, depois migrar para Heroku/Railway para produção.
