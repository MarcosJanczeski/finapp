# 📱 FINAPP2P — Financial & Patrimonial Manager  
### *Mobile-first, simple, educational, and fully powered by TypeScript*  
**(PT-BR + EN)**

---

# 🇧🇷 FINAPP2P – Gerenciador Financeiro e Patrimonial

**FINAPP2P** é um aplicativo *mobile-first* desenvolvido em **TypeScript, HTML e CSS**, com foco em:

- Controle financeiro familiar  
- Controle de pequenos negócios  
- Lançamentos simples e complexos (partidas dobradas por baixo dos panos)  
- Cadastro de pessoas (PF / PJ)  
- Integração com **OpenCNPJ**  
- Código pedagógico, modular e limpo  

---

# 🇺🇸 FINAPP2P – Financial & Asset Management App

A *mobile-first* financial management system built with **TypeScript, HTML and CSS**, designed for:

- Family finances  
- Small-business finance  
- Auto-complete via **OpenCNPJ**  
- Double-entry bookkeeping (hidden from the user)  
- Educational & production-ready architecture  

---

# 🎯 Objectives / Objetivos

## PT-BR
Criar um sistema simples e robusto que controle:
- despesas e receitas  
- contas a pagar/receber  
- bens, obrigações e patrimônio  
- pessoas físicas e jurídicas  
- previsões e recorrências  
- lançamentos mais completos sem complicar a interface  

## EN  
Build a simple yet powerful system to manage:
- expenses and income  
- payables/receivables  
- assets, liabilities, equity  
- individuals and companies  
- recurring transactions and predictions  

---

# 🧩 Main Features / Principais Funcionalidades

### ✔️ Cadastro de Pessoas (PF & PJ)
- Dados pessoais  
- Endereço  
- Contatos  
- **Empresa (PJ)**  
- **QSA – Quadro Societário**  
- Status ativo/inativo  
- Fluxo de novo cadastro simplificado  

### ✔️ Integração OpenCNPJ
Auto-preenchimento de:
- razão social  
- nome fantasia  
- natureza jurídica  
- CNAE  
- porte  
- capital social  
- endereço  
- quadro societário (QSA)  
- situação cadastral  
- data de fundação  

### ✔️ UI Mobile-first
- SPA verdadeira  
- Cabeçalho fixo  
- FAB flutuante  
- Filtros inteligentes (PF, PJ, clientes, fornecedores etc.)  

---

# 🏗 Architecture / Arquitetura

finapp/
├── dist/ → JS compilado (não versionado)
├── src/ → Código TS
│ ├── domain/ → Entidades e regras
│ ├── repositories/ → Acesso a dados
│ ├── services/ → Integrações externas
│ └── ui/ → Telas, navegação e interação
├── index.html → Container SPA
├── style.css → Layout mobile-first
├── package.json
├── tsconfig.json
└── .gitignore

---

# 🚀 Running the Project / Rodando o Projeto

### 1. Install dependencies

```bash
npm install

### 2. Compile TypeScript

npm run build
----------------------------------------
🛣 Roadmap

 Roles (cliente/fornecedor)

 Lançamentos simples

 Plano de contas

 Persistência real (LocalStorage → Supabase)

 Recorrências

 Projeção de saldo

 Backup/Restore

 Login e multiusuário

 Deploy (Vercel / GitHub Pages)

✨ Author / Autor

Marcos Janczeski
Campo Grande – MS
Desenvolvedor & idealizador do FINAPP2P