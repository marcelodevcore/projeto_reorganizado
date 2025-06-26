Sistema Comercial Alfa
Este é um sistema web completo desenvolvido para a gestão eficiente de produtos, fornecedores e pedidos de compra da empresa Comercial Alfa. Ele oferece uma interface intuitiva e funcionalidades robustas para otimizar as operações comerciais.
________________________________________
📦 Estrutura do Projeto
Para facilitar a compreensão e manutenção, o projeto está organizado da seguinte forma:
projeto_reorganizado/
│
├── index.html                # Página inicial do sistema (dashboard)
├── css/                      # Arquivos de estilo (incluindo tema escuro e customizações)
├── js/                       # Scripts JavaScript do frontend para interatividade
├── img/                      # Imagens e ícones utilizados no sistema
├── pages/                    # Páginas HTML específicas (produtos, fornecedores, pedidos, consultas)
├── backend/                  # Diretório do backend, desenvolvido em Node.js (API)
│   ├── src/
│   │   ├── config/           # Configurações do banco de dados
│   │   ├── controllers/      # Lógica de negócio e manipulação de dados
│   │   ├── models/           # Modelos de dados para interação com o banco
│   │   ├── routes/           # Definição das rotas da API
│   │   └── server.js         # Arquivo principal do servidor Express
│   └── package.json          # Dependências e scripts do backend
├── database/                 # Scripts SQL para criação e gerenciamento do banco
├── docs/                     # Documentação adicional (arquivos .md e .docx)
├── INSTRUCOES_RAPIDAS.md     # Guia rápido para instalação e uso
├── ESTRUTURA.md              # Detalhamento da estrutura do projeto
└── ...                       # Outros arquivos e diretórios relevantes
________________________________________
🚀 Instalação e Execução
Siga os passos abaixo para configurar e iniciar o Sistema Comercial Alfa em seu ambiente:
1. Banco de Dados
•	Instale o MySQL 8+ em seu sistema.
•	Execute o script database/create_database.sql para criar o banco de dados e popular com dados iniciais essenciais:
mysql -u root -p < database/create_database.sql
2. Backend
O backend é responsável pela lógica de negócio e comunicação com o banco de dados:
•	Navegue até o diretório backend:
cd backend
•	Instale todas as dependências necessárias do projeto:
npm install
•	Inicie o servidor do backend:
npm start
O backend estará em execução e acessível em http://localhost:3000.
3. Frontend
O frontend é a interface do usuário. Você pode acessá-lo de duas maneiras:
•	Simplesmente abra o arquivo index.html diretamente em seu navegador.
•	Alternativamente, para uma experiência mais robusta, inicie um servidor web local (recomendado):
python -m http.server 8000
Após iniciar o servidor, acesse o sistema através do seu navegador em: http://localhost:8000.
🖥️ Funcionalidades
O Sistema Comercial Alfa oferece um conjunto abrangente de funcionalidades para gerenciar suas operações:
•	Dashboard: Uma visão geral interativa com gráficos, estatísticas importantes, alertas de estoque baixo e uma lista de pedidos recentes para acompanhamento rápido.
•	Produtos: Gerencie seu catálogo de produtos, incluindo cadastro, edição, exclusão e filtros por categoria. O sistema também emite alertas para produtos com estoque baixo.
•	Fornecedores: Mantenha um registro detalhado de seus fornecedores, com opções de cadastro, edição, exclusão e filtros por estado para facilitar a localização.
•	Pedidos: Crie e gerencie pedidos de compra de forma eficiente. Ao registrar um pedido, o estoque dos produtos é automaticamente atualizado. Permite a seleção de fornecedores e múltiplos produtos em um único pedido.
•	Consulta de Pedidos: Realize consultas detalhadas de pedidos utilizando filtros por data, fornecedor e produto. É possível exportar os resultados para CSV e visualizar detalhes completos de cada pedido.
🔗 Endpoints da API
A API RESTful do sistema expõe os seguintes endpoints para interação programática:
•	Produtos: GET /api/produtos (listar), POST /api/produtos (criar), PUT /api/produtos/:id (atualizar), DELETE /api/produtos/:id (excluir).
•	Fornecedores: GET /api/fornecedores (listar), POST /api/fornecedores (criar), PUT /api/fornecedores/:id (atualizar), DELETE /api/fornecedores/:id (excluir).
•	Pedidos: GET /api/pedidos (listar), POST /api/pedidos (criar), GET /api/pedidos/:id (buscar por ID).
•	Filtros e Buscas Específicas: Exemplos incluem /api/produtos/estoque-baixo para produtos com estoque reduzido e /api/fornecedores/estado/:estado para filtrar fornecedores por estado.
🗄️ Banco de Dados
Detalhes sobre a estrutura e configuração do banco de dados MySQL:
•	Tabelas Principais: produtos, fornecedores, categorias, pedidos, itens_pedido, usuarios.
•	Charset: utf8mb4 para suporte a uma ampla gama de caracteres.
•	Collation: utf8mb4_unicode_ci para ordenação e comparação de strings sensíveis a acentos.
•	View: vw_pedidos_detalhes é uma view otimizada para a geração de relatórios complexos.
📝 Observações
Considerações importantes sobre o funcionamento do sistema:
•	Pedidos: É fundamental notar que, ao criar um pedido de compra, o estoque do produto correspondente é automaticamente aumentado, simulando a entrada de mercadorias de um fornecedor.
•	Filtros: Todos os filtros e operações de busca são processados no lado do servidor via API, garantindo que os dados estejam sempre atualizados e evitando o uso de armazenamento local (localStorage).
•	Encoding: O sistema foi desenvolvido com suporte completo a UTF-8, o que assegura a correta exibição e manipulação de acentos, cedilhas e outros caracteres especiais em todas as suas partes.
•	Visual: A interface do usuário é moderna, responsiva e adaptável a diferentes tamanhos de tela. Possui um tema escuro elegante, botões bem desenhados e gráficos centralizados para uma experiência visual agradável e consistente.
🆘 Suporte e Dúvidas
Para qualquer dúvida ou necessidade de suporte, consulte os seguintes recursos:
•	Documentação Detalhada: Verifique os arquivos localizados no diretório docs/ para instruções e informações aprofundadas sobre o sistema.
•	Guia Rápido: Para uma visão geral e passos iniciais, consulte o arquivo INSTRUCOES_RAPIDAS.md.
•	Diagnóstico: Em caso de problemas, é recomendável verificar os logs do backend (no terminal onde o servidor está rodando) e o console do navegador (geralmente acessível pela tecla F12) para identificar mensagens de erro.
