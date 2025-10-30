## Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- **Node.js** (versão 16 ou superior) - [Download](https://nodejs.org/)
- **npm** ou **yarn** (geralmente vem com Node.js)
- **Git** - [Download](https://git-scm.com/)
- Uma conta no **Supabase** - [Criar conta gratuita](https://supabase.com/)

## Configuração do Projeto

### 1. Clone o repositório

```bash
git clone https://github.com/Eduarddo-sm/littera.git
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
```

##### Habilitar Row Level Security (RLS)

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE anuncios ENABLE ROW LEVEL SECURITY;
ALTER TABLE propostas ENABLE ROW LEVEL SECURITY;
```

##### Políticas para `profiles`

```sql
-- Perfis são visíveis para todos
CREATE POLICY "Perfis são visíveis para todos" 
  ON profiles FOR SELECT 
  USING (true);

-- Usuários podem inserir seu próprio perfil
CREATE POLICY "Usuários podem inserir seu próprio perfil" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);
```

##### Políticas para `anuncios`

```sql
-- Anúncios são visíveis para todos
CREATE POLICY "Anúncios são visíveis para todos" 
  ON anuncios FOR SELECT 
  USING (true);

-- Usuários podem criar seus próprios anúncios
CREATE POLICY "Usuários podem criar seus próprios anúncios" 
  ON anuncios FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios anúncios
CREATE POLICY "Usuários podem atualizar seus próprios anúncios" 
  ON anuncios FOR UPDATE 
  USING (auth.uid() = user_id);

-- Usuários podem deletar seus próprios anúncios
CREATE POLICY "Usuários podem deletar seus próprios anúncios" 
  ON anuncios FOR DELETE 
  USING (auth.uid() = user_id);
```

##### Políticas para `propostas`

```sql
-- Propostas visíveis para interessado e anunciante
CREATE POLICY "Propostas visíveis para interessado e anunciante" 
  ON propostas FOR SELECT 
  USING (auth.uid() = interessado_id OR auth.uid() = anunciante_id);

-- Usuários podem criar propostas
CREATE POLICY "Usuários podem criar propostas" 
  ON propostas FOR INSERT 
  WITH CHECK (auth.uid() = interessado_id);

-- Interessados podem atualizar suas propostas
CREATE POLICY "Interessados podem atualizar suas propostas" 
  ON propostas FOR UPDATE 
  USING (auth.uid() = interessado_id);

-- Anunciantes podem atualizar status de propostas
CREATE POLICY "Anunciantes podem atualizar status de propostas" 
  ON propostas FOR UPDATE 
  USING (auth.uid() = anunciante_id);
```

#### 3.3. Configure o Storage

No painel do Supabase, vá em **Storage** e crie os seguintes buckets:

##### Criar buckets

1. Clique em "Create a new bucket"
2. Crie o bucket **`livros`** (público)
3. Crie o bucket **`userProfiles`** (público)
4. Crie o bucket **`proposta`** (público)

##### Configurar políticas de Storage

No SQL Editor, execute:

```sql
-- Tornar buckets públicos
UPDATE storage.buckets 
SET public = true 
WHERE id IN ('livros', 'userProfiles', 'proposta');

-- Políticas para bucket 'livros'
CREATE POLICY "Imagens de livros são públicas" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'livros');

CREATE POLICY "Usuários autenticados podem fazer upload em livros" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'livros' AND auth.role() = 'authenticated');

-- Políticas para bucket 'userProfiles'
CREATE POLICY "Avatares são públicos" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'userProfiles');

CREATE POLICY "Usuários podem fazer upload de avatar" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'userProfiles' AND auth.role() = 'authenticated');

CREATE POLICY "Usuários podem atualizar seu avatar" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'userProfiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem deletar seu avatar" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'userProfiles' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Políticas para bucket 'proposta'
CREATE POLICY "Imagens de propostas são públicas" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'proposta');

CREATE POLICY "Usuários autenticados podem fazer upload em propostas" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'proposta' AND auth.role() = 'authenticated');
```

#### 3.4. Configure Autenticação

No painel do Supabase:

1. Vá em **Authentication** → **Providers**
2. Habilite **Email** como provedor de autenticação
3. Em **Email Templates**, personalize os templates de confirmação de email (opcional)
4. Em **URL Configuration**, configure:
   - **Site URL**: `http://localhost:5173` (para desenvolvimento)
   - **Redirect URLs**: Adicione `http://localhost:5173/**`

### 4. Configure as variáveis de ambiente

Crie um arquivo **.env** na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

**⚠️ IMPORTANTE:** 
- Substitua os valores pelos dados do seu projeto Supabase
- Nunca commite o arquivo .env no repositório
- O arquivo já está incluído no .gitignore

Use o arquivo .env.example como referência.

## Executando a aplicação

### Modo de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em: **http://localhost:5173**

### Build para produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta **dist**

### Visualizar build de produção localmente

```bash
npm run preview
```

## Estrutura do Projeto

```
littera/
├── src/
│   ├── images/                      # Assets e imagens
│   ├── lib/                         # Bibliotecas auxiliares
│   │   └── supabase-admin.ts        # Cliente admin do Supabase
│   ├── main/                        # Módulos TypeScript principais
│   │   ├── auth.ts                  # Guard de autenticação
│   │   ├── cadastro.ts              # Registro de usuários
│   │   ├── fetchBooks.ts            # Busca e renderização de livros
│   │   ├── fetchUser.ts             # Busca dados do usuário
│   │   ├── livroPagina.ts           # Página individual do livro
│   │   ├── login.ts                 # Sistema de login
│   │   ├── logout.ts                # Sistema de logout
│   │   ├── menuMobile.ts            # Menu mobile responsivo
│   │   ├── meusAnunciosOfertas.ts   # Gestão de anúncios e ofertas
│   │   ├── minhasPropostas.ts       # Gestão de propostas enviadas
│   │   ├── novoAnuncio.ts           # Cadastro de anúncios
│   │   ├── novaProposta.ts          # Envio de propostas
│   │   ├── popup.ts                 # Sistema de notificações
│   │   ├── searchToggle.ts          # Toggle de busca
│   │   ├── supabase.ts              # Cliente Supabase
│   │   └── userArea.ts              # Área do usuário
│   ├── pages/                       # Páginas HTML e CSS
│   │   ├── cadastro/                # Página de registro
│   │   ├── livro/                   # Página do livro
│   │   ├── login/                   # Página de login
│   │   ├── meusAnuncios/            # Página de anúncios
│   │   ├── minhasPropostas/         # Página de propostas
│   │   ├── termos/                  # Termos e condições
│   │   ├── userarea/                # Área do usuário
│   │   └── reset.css                # CSS reset global
│   ├── styles/                      # Estilos globais
│   │   └── styles.css
│   ├── env.d.ts                     # Tipos TypeScript para env
│   └── index.html                   # Página principal
├── .env                             # Variáveis de ambiente (não versionado)
├── .env.example                     # Exemplo de variáveis de ambiente
├── .gitignore                       # Arquivos ignorados pelo Git
├── package.json                     # Dependências do projeto
├── tsconfig.json                    # Configuração TypeScript
├── vite.config.ts                   # Configuração Vite
└── README.md                        # Este arquivo
```

## Funcionalidades Principais

### Autenticação
- Registro de novos usuários com confirmação por email
- Login com email e senha
- Recuperação de senha
- Logout seguro
- Proteção de rotas com `authGuard`

### Gestão de Perfil
- Edição de informações pessoais (nome, username, telefone, bio)
- Upload e atualização de avatar
- Visualização de perfil público

### Anúncios de Livros
- Cadastro de anúncios com múltiplas imagens (até 5)
- Adição de gêneros literários (até 10)
- Visualização detalhada com galeria de imagens
- Edição e exclusão de anúncios próprios
- Controle de status (Aberto/Fechado)
- Busca por título

### Sistema de Propostas
- Envio de propostas com mensagem, valor e imagem
- Visualização de propostas recebidas
- Aceitação ou recusa de propostas
- Histórico de propostas enviadas
- Cancelamento de propostas pendentes
- Exibição de telefone ao aceitar proposta

### Gestão de Imagens
- Upload para Supabase Storage
- Preview antes do envio
- Remoção individual de imagens
- Múltiplas imagens por anúncio
- Galeria com navegação

## Arquivos Principais

### Autenticação e Usuário
- auth.ts - Guard de autenticação
- login.ts - Sistema de login
- cadastro.ts - Registro de usuários
- logout.ts - Logout
- fetchUser.ts - Busca dados do usuário

### Anúncios e Livros
- novoAnuncio.ts - Cadastro de anúncios
- fetchBooks.ts - Busca e listagem de livros
- livroPagina.ts - Página individual do livro
- meusAnunciosOfertas.ts - Gestão de anúncios

### Propostas
- novaProposta.ts - Envio de propostas
- minhasPropostas.ts - Gestão de propostas

### Utilitários
- popup.ts - Sistema de notificações
- supabase.ts - Cliente Supabase
- menuMobile.ts - Menu mobile

## Tecnologias Utilizadas

- **[TypeScript](https://www.typescriptlang.org/)** - Linguagem de programação
- **[Vite](https://vitejs.dev/)** - Build tool e dev server
- **[Supabase](https://supabase.com/)** - Backend as a Service
  - Autenticação
  - Banco de dados PostgreSQL
  - Storage de arquivos
  - Row Level Security (RLS)
- **HTML5 & CSS3** - Estrutura e estilização

## Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Gera build de produção
npm run preview  # Visualiza build de produção localmente
```

## Solução de Problemas

### Erro "Usuário não autenticado"

**Causa:** As variáveis de ambiente não estão configuradas ou o usuário não fez login.

**Solução:**
1. Verifique se o arquivo .env existe e contém os valores corretos
2. Certifique-se de estar logado na aplicação
3. Limpe o cache do navegador e tente novamente

### Erro ao fazer upload de imagens

**Causa:** Os buckets de storage não foram criados ou as políticas não estão configuradas.

**Solução:**
1. Verifique se os buckets `livros`, `userProfiles` e `proposta` existem no Supabase
2. Confirme que os buckets estão configurados como públicos
3. Execute novamente as políticas de storage do passo 3.3

### Erro "Erro ao inserir no banco"

**Causa:** As tabelas não foram criadas ou as políticas RLS estão bloqueando a inserção.

**Solução:**
1. Verifique se todas as tabelas foram criadas (passo 3.2)
2. Confirme que as políticas RLS estão habilitadas e configuradas
3. Verifique no console do navegador qual erro específico está ocorrendo

### Imagens não aparecem

**Causa:** URLs das imagens estão incorretas ou os buckets não são públicos.

**Solução:**
1. Verifique se os buckets estão configurados como públicos
2. Teste acessar diretamente a URL de uma imagem no navegador
3. Confirme que as políticas de SELECT estão configuradas

### Página em branco após o build

**Causa:** O caminho base do Vite pode estar incorreto.

**Solução:**
1. Verifique a configuração `base` no vite.config.ts
2. Para deploy, pode ser necessário ajustar para `base: '/'`
3. Reconstrua o projeto com `npm run build`

## Segurança

- **Row Level Security (RLS)** habilitado em todas as tabelas
- **Validação de dados** no frontend e backend (via RLS)
- **Autenticação obrigatória** para ações sensíveis
- **Políticas de acesso** granulares por usuário
- **Variáveis de ambiente** para dados sensíveis

## Responsividade

A aplicação é totalmente responsiva e funciona em:
- Desktop (1920px+)
- Tablets (768px - 1024px)
- Mobile (320px - 767px)

## Licença

Este projeto é de propriedade de Littera. Todos os direitos reservados.

## Contato e Suporte

Para dúvidas, sugestões ou reportar problemas:

- Abra uma issue no repositório
- Entre em contato através do email do projeto

---