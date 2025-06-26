# Modelo do Banco de Dados - Sistema Comercial Alfa

## Visão Geral
Este documento descreve a estrutura do banco de dados do Sistema Comercial Alfa, incluindo tabelas, relacionamentos e configurações.

## Configuração do Banco
- **Nome**: `comercial_alfa`
- **Charset**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`
- **Engine**: InnoDB

## Estrutura das Tabelas

### 1. Tabela `fornecedores`
Armazena informações dos fornecedores do sistema.

| Campo | Tipo | Tamanho | Null | Chave | Descrição |
|-------|------|---------|------|-------|-----------|
| id | INT | - | NO | PK, AI | Identificador único |
| nome | VARCHAR | 100 | NO | - | Nome da empresa |
| cnpj | VARCHAR | 14 | NO | UK | CNPJ único |
| cidade | VARCHAR | 50 | NO | - | Cidade |
| estado | CHAR | 2 | NO | - | Estado (UF) |
| telefone | VARCHAR | 15 | YES | - | Telefone |
| email | VARCHAR | 100 | YES | - | Email |
| endereco | VARCHAR | 200 | YES | - | Endereço completo |
| data_cadastro | TIMESTAMP | - | YES | - | Data de cadastro |
| ativo | BOOLEAN | - | YES | - | Status ativo/inativo |

### 2. Tabela `categorias`
Categorias de produtos disponíveis no sistema.

| Campo | Tipo | Tamanho | Null | Chave | Descrição |
|-------|------|---------|------|-------|-----------|
| id | INT | - | NO | PK, AI | Identificador único |
| nome | VARCHAR | 50 | NO | UK | Nome da categoria |
| descricao | VARCHAR | 200 | YES | - | Descrição da categoria |

### 3. Tabela `produtos`
Cadastro de produtos disponíveis para pedidos.

| Campo | Tipo | Tamanho | Null | Chave | Descrição |
|-------|------|---------|------|-------|-----------|
| id | INT | - | NO | PK, AI | Identificador único |
| codigo | VARCHAR | 20 | NO | UK | Código do produto |
| nome | VARCHAR | 100 | NO | - | Nome do produto |
| categoria_id | INT | - | YES | FK | Referência à categoria |
| preco | DECIMAL | 10,2 | NO | - | Preço unitário |
| estoque | INT | - | NO | - | Quantidade em estoque |
| estoque_minimo | INT | - | YES | - | Estoque mínimo |
| descricao | TEXT | - | YES | - | Descrição do produto |
| data_cadastro | TIMESTAMP | - | YES | - | Data de cadastro |
| ativo | BOOLEAN | - | YES | - | Status ativo/inativo |

### 4. Tabela `pedidos`
Cabeçalho dos pedidos realizados.

| Campo | Tipo | Tamanho | Null | Chave | Descrição |
|-------|------|---------|------|-------|-----------|
| id | INT | - | NO | PK, AI | Identificador único |
| data | DATE | - | NO | - | Data do pedido |
| fornecedor_id | INT | - | NO | FK | Referência ao fornecedor |
| observacoes | TEXT | - | YES | - | Observações do pedido |
| data_registro | TIMESTAMP | - | YES | - | Data de registro |

### 5. Tabela `itens_pedido`
Itens individuais de cada pedido.

| Campo | Tipo | Tamanho | Null | Chave | Descrição |
|-------|------|---------|------|-------|-----------|
| id | INT | - | NO | PK, AI | Identificador único |
| pedido_id | INT | - | NO | FK | Referência ao pedido |
| produto_id | INT | - | NO | FK | Referência ao produto |
| quantidade | INT | - | NO | - | Quantidade solicitada |
| preco_unitario | DECIMAL | 10,2 | NO | - | Preço unitário no momento |

### 6. Tabela `usuarios`
Usuários do sistema (para futura implementação de autenticação).

| Campo | Tipo | Tamanho | Null | Chave | Descrição |
|-------|------|---------|------|-------|-----------|
| id | INT | - | NO | PK, AI | Identificador único |
| nome | VARCHAR | 100 | NO | - | Nome do usuário |
| email | VARCHAR | 100 | NO | UK | Email único |
| senha | VARCHAR | 255 | NO | - | Senha criptografada |
| perfil | ENUM | - | YES | - | Perfil (admin/usuario) |
| ultimo_acesso | TIMESTAMP | - | YES | - | Último acesso |
| ativo | BOOLEAN | - | YES | - | Status ativo/inativo |

## Relacionamentos

### Chaves Estrangeiras
- `produtos.categoria_id` → `categorias.id`
- `pedidos.fornecedor_id` → `fornecedores.id`
- `itens_pedido.pedido_id` → `pedidos.id`
- `itens_pedido.produto_id` → `produtos.id`

### Índices
- `idx_produtos_categoria` - Otimiza consultas por categoria
- `idx_pedidos_fornecedor` - Otimiza consultas por fornecedor
- `idx_itens_pedido_produto` - Otimiza consultas de itens
- `idx_produtos_codigo` - Otimiza busca por código
- `idx_fornecedores_cnpj` - Otimiza busca por CNPJ

## Views

### `vw_pedidos_detalhes`
View que combina informações de pedidos, fornecedores, itens e produtos para consultas detalhadas.

**Campos incluídos:**
- Informações do pedido (ID, data, observações)
- Informações do fornecedor (nome, CNPJ)
- Informações dos itens (quantidade, preço, valor total)
- Informações dos produtos (código, nome, categoria)

## Dados Iniciais

### Categorias (8 categorias)
- Eletrônicos
- Periféricos
- Móveis
- Gaming
- Software
- Redes
- Acessórios
- Servidores

### Fornecedores (10 fornecedores)
- Distribuídos em diferentes estados brasileiros
- Incluem cidades como São Paulo, Brasília, Salvador, etc.

### Produtos (17 produtos)
- Variados por categoria
- Preços e estoques realistas
- Códigos organizados por categoria

### Pedidos (5 pedidos de exemplo)
- Com itens variados
- Diferentes fornecedores
- Datas recentes

## Considerações de Design

### Exclusão Lógica
- Tabelas `fornecedores` e `produtos` usam campo `ativo` para exclusão lógica
- Permite manter histórico de pedidos

### Integridade Referencial
- Chaves estrangeiras garantem consistência dos dados
- Cascade delete em `itens_pedido` quando pedido é excluído

### Performance
- Índices criados para otimizar consultas frequentes
- View para consultas complexas de pedidos

### Encoding
- UTF-8 (utf8mb4) para suportar caracteres especiais
- Collation unicode para ordenação correta
