-- Criação do banco de dados para o Sistema Comercial Alfa
-- Execute este script para criar o banco completo com encoding correto

-- Configurar encoding
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_unicode_ci';

-- Dropar banco se existir e recriar
DROP DATABASE IF EXISTS comercial_alfa;
CREATE DATABASE comercial_alfa
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE comercial_alfa;

-- Tabela de Fornecedores
CREATE TABLE fornecedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cnpj VARCHAR(14) NOT NULL UNIQUE,
    cidade VARCHAR(50) NOT NULL,
    estado CHAR(2) NOT NULL,
    telefone VARCHAR(15),
    email VARCHAR(100),
    endereco VARCHAR(200),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela de Categorias de Produtos
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(200)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela de Produtos
CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    categoria_id INT,
    preco DECIMAL(10, 2) NOT NULL,
    estoque INT NOT NULL DEFAULT 0,
    estoque_minimo INT DEFAULT 5,
    descricao TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela de Pedidos
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data DATE NOT NULL,
    fornecedor_id INT NOT NULL,
    observacoes TEXT,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela de Itens de Pedido
CREATE TABLE itens_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela de Usuários (para futura implementação de autenticação)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil ENUM('admin', 'usuario') DEFAULT 'usuario',
    ultimo_acesso TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Inserir categorias
INSERT INTO categorias (nome, descricao) VALUES
('Eletrônicos', 'Produtos eletrônicos em geral'),
('Periféricos', 'Periféricos para computadores'),
('Móveis', 'Móveis para escritório'),
('Gaming', 'Produtos para jogos e entretenimento'),
('Software', 'Programas e licenças de software'),
('Redes', 'Equipamentos de rede e conectividade'),
('Acessórios', 'Acessórios diversos para informática'),
('Servidores', 'Equipamentos para servidores');

-- Inserir fornecedores com encoding correto
INSERT INTO fornecedores (nome, cnpj, cidade, estado, telefone, email, endereco) VALUES
('Tech Solutions Ltda', '12345678000190', 'São Paulo', 'SP', '1133334444', 'contato@techsolutions.com', 'Av. Paulista, 1000'),
('Periféricos Express', '98765432000121', 'Rio de Janeiro', 'RJ', '2122223333', 'vendas@perifericosexpress.com', 'Rua do Comércio, 500'),
('Móveis Corporativos SA', '45678912000134', 'Belo Horizonte', 'MG', '3144445555', 'contato@moveiscorp.com', 'Av. Afonso Pena, 2000'),
('Futuro Tech', '77889900000111', 'Brasília', 'DF', '6133330000', 'contato@futurotech.com', 'SQS 115, Bloco A'),
('TechWorld Comércio', '55667788000199', 'Salvador', 'BA', '7133338888', 'contato@techworld.com', 'Av. Sete de Setembro, 300'),
('Inovação Digital', '66778899000100', 'Recife', 'PE', '8133339999', 'vendas@inovacaodigital.com', 'Rua da Aurora, 400'),
('Smart Solutions', '88990011000122', 'Curitiba', 'PR', '4133331111', 'vendas@smartsolutions.com', 'Rua XV de Novembro, 600'),
('TechPro Systems', '99001122000133', 'Fortaleza', 'CE', '8533332222', 'contato@techpro.com', 'Av. Beira Mar, 700'),
('Digital Innovation', '00112233000144', 'Manaus', 'AM', '9233333333', 'vendas@digitalinnovation.com', 'Av. Eduardo Ribeiro, 800'),
('CompuStore Brasil', '44556677000188', 'Porto Alegre', 'RS', '5133337777', 'vendas@compustore.com', 'Rua dos Andradas, 200');

-- Inserir produtos
INSERT INTO produtos (codigo, nome, categoria_id, preco, estoque, estoque_minimo, descricao) VALUES
('P001', 'Monitor LED 24"', 1, 899.90, 15, 5, 'Monitor LED Full HD 24 polegadas'),
('P002', 'Teclado Mecânico', 2, 299.90, 30, 10, 'Teclado mecânico com switches blue'),
('P003', 'Mouse Wireless', 2, 89.90, 25, 8, 'Mouse sem fio com bateria recarregável'),
('P004', 'Cadeira Gamer', 3, 1299.90, 8, 3, 'Cadeira ergonômica para gamers'),
('P005', 'Headset Bluetooth', 2, 199.90, 12, 5, 'Headset com conexão bluetooth'),
('G001', 'Mouse Gamer RGB', 4, 159.90, 25, 8, 'Mouse gamer com 6 botões e RGB'),
('G002', 'Teclado Gaming', 4, 399.90, 15, 5, 'Teclado mecânico gaming'),
('G003', 'Headset Gamer 7.1', 4, 299.90, 20, 6, 'Headset com som surround 7.1'),
('R001', 'Switch 8 Portas', 6, 299.90, 8, 3, 'Switch gerenciável 8 portas'),
('R002', 'Roteador WiFi 6', 6, 599.90, 10, 4, 'Roteador WiFi 6 com tecnologia Mesh'),
('S001', 'Office 365 Business', 5, 299.90, 50, 10, 'Licença Office 365 para 1 ano'),
('S002', 'Windows 11 Pro', 5, 899.90, 20, 5, 'Licença Windows 11 Professional'),
('S003', 'Antivírus Premium', 5, 199.90, 30, 8, 'Antivírus completo para 1 ano'),
('A001', 'Suporte para Monitor', 7, 199.90, 18, 6, 'Suporte articulado para monitor'),
('A002', 'Hub USB 3.0', 7, 89.90, 25, 8, 'Hub USB 3.0 com 4 portas'),
('SRV001', 'Servidor Rack 1U', 8, 8999.90, 3, 1, 'Servidor rack 1U com processador Intel Xeon'),
('SRV002', 'HDD Enterprise 4TB', 8, 899.90, 8, 2, 'HDD Enterprise 4TB 7200RPM');

-- Inserir pedidos de exemplo
INSERT INTO pedidos (data, fornecedor_id, observacoes) VALUES
(CURDATE(), 1, 'Pedido urgente para reposição de estoque'),
(DATE_SUB(CURDATE(), INTERVAL 1 DAY), 2, 'Pedido para evento corporativo'),
(DATE_SUB(CURDATE(), INTERVAL 7 DAY), 3, 'Pedido para nova filial'),
(DATE_SUB(CURDATE(), INTERVAL 2 DAY), 4, 'Pedido para reposição de estoque'),
(DATE_SUB(CURDATE(), INTERVAL 3 DAY), 5, 'Pedido para cliente corporativo');

-- Inserir itens dos pedidos
INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES
(1, 1, 2, 899.90),
(2, 3, 5, 89.90),
(3, 4, 1, 1299.90),
(4, 6, 3, 159.90),
(4, 7, 2, 399.90),
(5, 8, 5, 299.90);

-- Criar índices para otimização
CREATE INDEX idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX idx_pedidos_fornecedor ON pedidos(fornecedor_id);
CREATE INDEX idx_itens_pedido_produto ON itens_pedido(produto_id);
CREATE INDEX idx_produtos_codigo ON produtos(codigo);
CREATE INDEX idx_fornecedores_cnpj ON fornecedores(cnpj);

-- Criar view para consulta de pedidos com detalhes
CREATE OR REPLACE VIEW vw_pedidos_detalhes AS
SELECT 
    p.id AS pedido_id,
    p.data,
    p.observacoes,
    f.id AS fornecedor_id,
    f.nome AS fornecedor_nome,
    f.cnpj AS fornecedor_cnpj,
    ip.id AS item_id,
    ip.quantidade,
    ip.preco_unitario,
    (ip.quantidade * ip.preco_unitario) AS valor_total,
    pr.id AS produto_id,
    pr.codigo AS produto_codigo,
    pr.nome AS produto_nome,
    c.nome AS categoria_nome
FROM 
    pedidos p
    INNER JOIN fornecedores f ON p.fornecedor_id = f.id
    INNER JOIN itens_pedido ip ON p.id = ip.pedido_id
    INNER JOIN produtos pr ON ip.produto_id = pr.id
    LEFT JOIN categorias c ON pr.categoria_id = c.id;

-- Criar usuário admin inicial (senha: admin123)
INSERT INTO usuarios (nome, email, senha, perfil) VALUES
('Administrador', 'admin@comercialalfa.com', '$2b$10$X7GXjjcxLJ6YK7EVZ.EYo.wQdsQJCNZ7wJgwIJSa.lxQnzxvQXGjK', 'admin');

-- Verificar dados inseridos
SELECT 'Banco criado com sucesso!' as info;
SELECT 'Fornecedores:' as info;
SELECT COUNT(*) as total_fornecedores FROM fornecedores;
SELECT 'Produtos:' as info;
SELECT COUNT(*) as total_produtos FROM produtos;
SELECT 'Categorias:' as info;
SELECT COUNT(*) as total_categorias FROM categorias;
SELECT 'Pedidos:' as info;
SELECT COUNT(*) as total_pedidos FROM pedidos;
