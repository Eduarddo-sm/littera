## Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- **Node.js** (versão 16 ou superior) - [Download](https://nodejs.org/)
- **npm** (geralmente vem com Node.js) ou **yarn**
- **Git** - [Download](https://git-scm.com/)
- Uma conta no **Supabase** - [Criar conta gratuita](https://supabase.com/)

## Configuração do Projeto

### 1. Clone o repositório

```bash
git clone <https://github.com/Eduarddo-sm/littera.git>
cd littera
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

#### 3.1. Crie um novo projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote a **URL do projeto** e a **chave anon pública**

#### 3.2. Configure o banco de dados

Execute os seguintes comandos SQL no editor SQL do Supabase:

```sql
-- Tabela de perfis de usuários
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de anúncios de livros
CREATE TABLE anuncios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  autora TEXT,
  paginas INTEGER,
  editora TEXT,
  sobre TEXT,
  imagens TEXT[],
  generos TEXT[],
  status TEXT DEFAULT 'EM ABERTO',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de propostas
CREATE TABLE propostas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  anuncio_id UUID REFERENCES anuncios ON DELETE CASCADE NOT NULL,
  interessado_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  anunciante_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  mensagem TEXT,
  valor_oferecido DECIMAL(10,2),
  imagens TEXT[],
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE anuncios ENABLE ROW LEVEL SECURITY;
ALTER TABLE propostas ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Perfis são visíveis para todos" ON profiles FOR SELECT USING (true);
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Usuários podem inserir seu próprio perfil" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para anuncios
CREATE POLICY "Anúncios são visíveis para todos" ON anuncios FOR SELECT USING (true);
CREATE POLICY "Usuários podem criar seus próprios anúncios" ON anuncios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar seus próprios anúncios" ON anuncios FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar seus próprios anúncios" ON anuncios FOR DELETE USING (auth.uid() = user_id);

-- Políticas para propostas
CREATE POLICY "Propostas visíveis para interessado e anunciante" ON propostas FOR SELECT USING (
  auth.uid() = interessado_id OR auth.uid() = anunciante_id
);
CREATE POLICY "Usuários podem criar propostas" ON propostas FOR INSERT WITH CHECK (auth.uid() = interessado_id);
CREATE POLICY "Interessados podem atualizar suas propostas" ON propostas FOR UPDATE USING (auth.uid() = interessado_id);
CREATE POLICY "Anunciantes podem atualizar status de propostas" ON propostas FOR UPDATE USING (auth.uid() = anunciante_id);
```

#### 3.3. Configure o Storage

No Supabase, crie os seguintes buckets de storage:

1. **livros** - para imagens dos livros anunciados
2. **userProfiles** - para avatares dos usuários

Configure os buckets como públicos:

```sql
-- Tornar buckets públicos
UPDATE storage.buckets SET public = true WHERE id IN ('livros', 'userProfiles');

-- Políticas de storage para livros
CREATE POLICY "Imagens de livros são públicas" ON storage.objects FOR SELECT USING (bucket_id = 'livros');
CREATE POLICY "Usuários autenticados podem fazer upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'livros' AND auth.role() = 'authenticated'
);

-- Políticas de storage para userProfiles
CREATE POLICY "Avatares são públicos" ON storage.objects FOR SELECT USING (bucket_id = 'userProfiles');
CREATE POLICY "Usuários podem fazer upload de avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'userProfiles' AND auth.role() = 'authenticated'
);
CREATE POLICY "Usuários podem atualizar seu avatar" ON storage.objects FOR UPDATE USING (
  bucket_id = 'userProfiles' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Usuários podem deletar seu avatar" ON storage.objects FOR DELETE USING (
  bucket_id = 'userProfiles' AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 4. Configure as variáveis de ambiente

Crie um arquivo .env na raiz do projeto (use o .env.example como referência):

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica

# Opcional - para funcionalidades admin
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

**Importante:** Nunca commite o arquivo .env no repositório. Ele já está incluído no .gitignore.

## Executando a aplicação

### Modo de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Build para produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta dist

### Visualizar build de produção localmente

```bash
npm run preview
```

## Estrutura do Projeto

```
littera/
├── src/
│   ├── images/              # Imagens e assets
│   ├── lib/                 # Bibliotecas auxiliares
│   │   └── supabase-admin.ts
│   ├── main/                # Módulos TypeScript principais
│   │   ├── auth.ts          # Autenticação
│   │   ├── cadastro.ts      # Registro de usuários
│   │   ├── fetchBooks.ts    # Busca de livros
│   │   ├── livroPagina.ts   # Página individual do livro
│   │   ├── login.ts         # Login
│   │   ├── meusAnunciosOfertas.ts
│   │   ├── minhasPropostas.ts
│   │   ├── novoAnuncio.ts   # Cadastro de anúncios
│   │   ├── novaProposta.ts  # Envio de propostas
│   │   └── ...
│   ├── pages/               # Páginas HTML e CSS
│   │   ├── cadastro/
│   │   ├── livro/
│   │   ├── login/
│   │   ├── meusAnuncios/
│   │   ├── minhasPropostas/
│   │   ├── termos/
│   │   └── userarea/
│   ├── styles/              # Estilos globais
│   └── index.html           # Página principal
├── .env                     # Variáveis de ambiente (não versionado)
├── .env.example             # Exemplo de variáveis de ambiente
├── package.json             # Dependências do projeto
├── tsconfig.json            # Configuração TypeScript
├── vite.config.ts           # Configuração Vite
└── README.md                # Este arquivo
```

## Funcionalidades Principais

- **Autenticação de usuários** - Registro, login e recuperação de senha
- **Perfil de usuário** - Edição de informações pessoais e avatar
- **Anúncios de livros** - Criar, editar e fechar anúncios
- **Propostas** - Enviar e receber propostas de compra/troca
- **Busca** - Pesquisar livros por título
- **Gestão de imagens** - Upload e visualização de múltiplas imagens

## Tecnologias Utilizadas

- **[TypeScript](https://www.typescriptlang.org/)** - Linguagem de programação
- **[Vite](https://vitejs.dev/)** - Build tool e dev server
- **[Supabase](https://supabase.com/)** - Backend as a Service (autenticação, banco de dados, storage)
- **HTML5 & CSS3** - Estrutura e estilização

## Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Gera build de produção
npm run preview  # Visualiza build de produção
```

## Solução de Problemas

### Erro de autenticação ao fazer login/cadastro

- Verifique se as variáveis de ambiente estão corretas no arquivo .env
- Confirme se o projeto Supabase está ativo e configurado corretamente

### Imagens não aparecem

- Verifique se os buckets de storage foram criados e configurados como públicos
- Confirme se as políticas de storage estão corretas

### Erro ao inserir dados no banco

- Verifique se as tabelas foram criadas corretamente
- Confirme se as políticas RLS estão habilitadas e configuradas

## Licença

Este projeto está sob a licença especificada no arquivo de licença do repositório.

## Contato

Para dúvidas ou sugestões, entre em contato através dos canais oficiais do projeto.

---

**Desenvolvido com ❤️ pela equipe Littera**

Duzoka: consegue criar o readme 

Workspace: Collecting workspace information# Littera - Plataforma de Troca e Venda de Livros

Uma plataforma web completa para anúncio, venda e troca de livros entre usuários. Desenvolvida com TypeScript, Vite e Supabase.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- **Node.js** (versão 16 ou superior) - [Download](https://nodejs.org/)
- **npm** ou **yarn** (geralmente vem com Node.js)
- **Git** - [Download](https://git-scm.com/)
- Uma conta no **Supabase** - [Criar conta gratuita](https://supabase.com/)

## 🚀 Configuração do Projeto

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd littera
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

#### 3.1. Crie um novo projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em "New Project"
3. Preencha as informações do projeto (nome, senha do banco, região)
4. Aguarde a criação do projeto (pode levar alguns minutos)
5. No painel do projeto, vá em **Settings** → **API**
6. Copie a **URL do projeto** e a **chave `anon` pública**

#### 3.2. Configure o banco de dados

No painel do Supabase, vá em **SQL Editor** e execute os seguintes comandos:

##### Criar tabelas

```sql
-- Tabela de perfis de usuários
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  name TEXT,
  email TEXT,
  phone TEXT,
  avatar
