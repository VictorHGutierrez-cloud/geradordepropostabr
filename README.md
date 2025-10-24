# 🏢 Factorial - Sistema de Geração de Propostas Interno

Um sistema completo para automatizar a criação de propostas comerciais da Factorial, desde a transcrição de reuniões até a geração de documentos profissionais em PDF.

## ✨ Funcionalidades Principais

### 🎤 Transcrição de Reuniões com IA
- Upload de transcrições prontas
- Extração automática de informações do cliente
- Identificação de dores e requisitos
- Processamento com IA para análise de conteúdo

### 📄 Gerador de Propostas Factorial
- Templates específicos para segmentos (Startups, Pequenas, Médias, Grandes empresas)
- Preenchimento automático com dados da reunião
- Seleção de planos Factorial (Starter €2.50, Professional €3.50, Enterprise €4.50)
- Cálculo automático de preços por funcionário
- Preview em tempo real

### 🖼️ Gerenciador de Imagens
- Upload e organização de imagens
- Categorização automática
- Sistema de tags
- Integração com propostas
- Armazenamento local seguro

### 📊 Exportação Profissional
- Geração de PDF com formatação otimizada
- Download automático de arquivos
- Integração de imagens nas propostas
- Layout responsivo e profissional

## 🛠️ Como Usar

### 1. Acesso ao Sistema
- Acesse: `https://victorhgutierrez-cloud.github.io/geradordepropostabr/`
- Ou abra localmente o arquivo `index.html`

### 2. Fluxo de Trabalho

#### Opção A: Transcrição → Proposta
1. **Transcrever Reunião**
   - Acesse "Transcrever Reunião"
   - Cole a transcrição pronta
   - Aguarde o processamento com IA
   - Revise as informações extraídas

2. **Gerar Proposta**
   - Acesse "Gerar Proposta Factorial"
   - Os dados da reunião serão preenchidos automaticamente
   - Selecione o plano apropriado
   - Personalize conforme necessário
   - Gere e baixe o PDF

#### Opção B: Proposta Direta
1. **Gerar Proposta**
   - Acesse "Gerar Proposta Factorial"
   - Preencha manualmente os dados do cliente
   - Selecione o plano
   - Gere e baixe o PDF

### 3. Gerenciamento de Imagens
1. Acesse "Gerenciar Imagens"
2. Faça upload de logos, diagramas, gráficos
3. Organize por categorias
4. As imagens ficam disponíveis para uso nas propostas

## 📁 Estrutura de Arquivos

```
geradordepropostabr/
├── index.html                           # Página principal
├── factorial-proposal-generator.html    # Gerador de propostas Factorial
├── proposal-generator-fixed.html        # Gerador de propostas genérico
├── meeting-transcriber.html             # Transcritor de reuniões
├── image-manager.html                   # Gerenciador de imagens
├── package.json                         # Configurações do projeto
├── SOLUCAO-FACTORIAL.md                 # Solução específica para Factorial
├── PLANO-FACTORIAL.md                   # Plano de implementação
└── README.md                            # Este arquivo
```

## 🔧 Tecnologias Utilizadas

- **HTML5** - Estrutura das páginas
- **CSS3** - Estilização e layout responsivo
- **JavaScript** - Funcionalidades interativas
- **Tailwind CSS** - Framework CSS para design
- **Lucide Icons** - Ícones profissionais
- **jsPDF** - Geração de PDFs
- **html2canvas** - Conversão HTML para imagem
- **LocalStorage** - Armazenamento local de dados

## 🎯 Segmentos Factorial

O sistema está otimizado para diferentes segmentos:

### 🚀 Startups (1-50 funcionários)
- Preço: €2.50/funcionário/mês
- Foco em automação básica de RH
- Setup e onboarding incluído

### 🏢 Pequenas Empresas (51-200 funcionários)
- Preço: €3.50/funcionário/mês
- Gestão de RH completa
- Relatórios avançados

### 🏭 Médias Empresas (201-1000 funcionários)
- Preço: €4.50/funcionário/mês
- Integrações avançadas
- Suporte prioritário

### 🌍 Grandes Empresas (1000+ funcionários)
- Preço: €4.50/funcionário/mês
- Funcionários ilimitados
- Account Manager dedicado

## 💡 Dicas de Uso

### Para Vendedores Factorial
1. **Prepare-se para a reunião**: Tenha uma lista de perguntas-chave
2. **Use o transcritor**: Cole a transcrição pronta
3. **Revise os dados**: Sempre confirme as informações extraídas
4. **Personalize**: Ajuste a proposta conforme necessário
5. **Teste o PDF**: Verifique se tudo está correto antes de enviar

### Para Gestores
1. **Padronize o processo**: Use sempre o mesmo fluxo
2. **Treine a equipe**: Ensine como usar cada ferramenta
3. **Monitore resultados**: Acompanhe o tempo de criação de propostas
4. **Colete feedback**: Melhore continuamente o sistema

## 🚨 Solução de Problemas

### Problema: PDF não gera
**Solução**: Verifique se todas as bibliotecas carregaram corretamente. Recarregue a página.

### Problema: Transcrição não funciona
**Solução**: Certifique-se de que a transcrição foi colada corretamente.

### Problema: Imagens não aparecem
**Solução**: Certifique-se de que as imagens foram carregadas no gerenciador.

### Problema: Dados da reunião não aparecem
**Solução**: Verifique se você clicou em "Gerar Proposta Automatizada" no transcritor.

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique este README
2. Teste em diferentes navegadores
3. Limpe o cache do navegador
4. Verifique a conexão com a internet

## 🔄 Atualizações Futuras

- [ ] Integração com APIs de transcrição reais
- [ ] Mais templates de proposta
- [ ] Sistema de usuários e login
- [ ] Backup na nuvem
- [ ] Integração com CRM
- [ ] Analytics de propostas

## 📄 Licença

Este projeto é de uso interno da Factorial. Todos os direitos reservados.

---

**Desenvolvido com ❤️ para automatizar e otimizar o processo de vendas da Factorial.**
