// Script para a página de produtos
document.addEventListener('DOMContentLoaded', function() {
    // Carregar lista de produtos e categorias
    carregarProdutos();
    carregarCategorias();
    
    // Configurar eventos
    document.getElementById('btn-salvar-produto').addEventListener('click', salvarProduto);
    document.getElementById('btn-atualizar-produto').addEventListener('click', atualizarProduto);
    document.getElementById('btn-limpar-filtro').addEventListener('click', limparFiltros);
    document.getElementById('busca-produto').addEventListener('input', filtrarProdutos);
    document.getElementById('filtro-categoria').addEventListener('change', filtrarProdutos);
});

// Função para carregar categorias
async function carregarCategorias() {
    try {
        const categorias = await window.api.produtos.getCategorias();
        preencherSelectCategorias(categorias);
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        mostrarAlerta('Erro ao carregar categorias. Tente novamente mais tarde.', 'danger');
    }
}

// Função para preencher selects de categorias
function preencherSelectCategorias(categorias) {
    const selects = [
        document.getElementById('categoria'),
        document.getElementById('edit-categoria'),
        document.getElementById('filtro-categoria')
    ];
    
    selects.forEach(select => {
        if (select) {
            // Salvar a primeira opção (Selecione... ou Todas as categorias)
            const firstOption = select.querySelector('option');
            const firstOptionText = firstOption ? firstOption.textContent : '';
            const firstOptionValue = firstOption ? firstOption.value : '';
            
            // Limpar todas as opções
            select.innerHTML = '';
            
            // Recriar a primeira opção
            if (firstOptionText) {
                const option = document.createElement('option');
                option.value = firstOptionValue;
                option.textContent = firstOptionText;
                select.appendChild(option);
            }
            
            // Adicionar opções das categorias
            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = categoria.nome;
                select.appendChild(option);
            });
        }
    });
}

// Função para carregar produtos
async function carregarProdutos() {
    try {
        const produtos = await window.api.produtos.getAll();
        renderizarProdutos(produtos);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        mostrarAlerta('Erro ao carregar produtos. Tente novamente mais tarde.', 'danger');
    }
}

// Função para renderizar produtos na tabela
function renderizarProdutos(produtos) {
    const tbody = document.getElementById('lista-produtos');
    
    if (!produtos || produtos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum produto cadastrado</td></tr>';
        return;
    }
    
    let html = '';
    produtos.forEach(produto => {
        // Verificar estoque baixo
        const estoqueClasse = produto.estoque <= (produto.estoque_minimo || 5) ? 'text-danger fw-bold' : '';
        
        html += `
            <tr>
                <td>${produto.codigo}</td>
                <td>${produto.nome}</td>
                <td>${produto.categoria_nome || 'N/A'}</td>
                <td>${formatarMoeda(produto.preco)}</td>
                <td class="${estoqueClasse}">${produto.estoque}</td>
                <td>
                    <div class="btn-group" role="group" style="gap: 0.8rem;">
                        <button type="button" class="btn btn-outline-primary btn-md px-2 py-1" onclick="editarProduto(${produto.id})" data-bs-toggle="tooltip" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger btn-md px-2 py-1" onclick="confirmarExclusao(${produto.id})" data-bs-toggle="tooltip" title="Excluir">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    // Reinicializar tooltips
    const tooltips = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltips.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl, {
            customClass: 'custom-tooltip'
        });
    });
}

// Função para salvar novo produto
async function salvarProduto() {
    // Obter dados do formulário
    const codigo = document.getElementById('codigo').value.trim();
    const nome = document.getElementById('nome').value.trim();
    const categoria_id = parseInt(document.getElementById('categoria').value);
    const preco = parseFloat(document.getElementById('preco').value);
    const estoque = parseInt(document.getElementById('estoque').value);
    const estoque_minimo = parseInt(document.getElementById('estoque_minimo').value) || 5;
    const descricao = document.getElementById('descricao').value.trim();
    
    // Validar campos obrigatórios
    if (!codigo || !nome || !categoria_id || isNaN(preco) || isNaN(estoque)) {
        mostrarAlerta('Preencha todos os campos obrigatórios', 'warning');
        return;
    }
    
    // Criar objeto do produto
    const produto = {
        codigo,
        nome,
        categoria_id,
        preco,
        estoque,
        estoque_minimo,
        descricao
    };
    
    try {
        // Salvar produto
        await window.api.produtos.create(produto);
        
        // Fechar modal
        const modalEl = document.getElementById('modalNovoProduto');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        
        // Limpar formulário
        document.getElementById('form-produto').reset();
        
        // Recarregar lista de produtos
        carregarProdutos();
        
        // Mostrar mensagem de sucesso
        mostrarAlerta('Produto cadastrado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
        mostrarAlerta('Erro ao salvar produto. Tente novamente.', 'danger');
    }
}

// Função para editar produto
async function editarProduto(id) {
    try {
        // Buscar produto pelo ID
        const produto = await window.api.produtos.getById(id);
        
        // Preencher formulário de edição
        document.getElementById('edit-id').value = produto.id;
        document.getElementById('edit-codigo').value = produto.codigo;
        document.getElementById('edit-nome').value = produto.nome;
        document.getElementById('edit-categoria').value = produto.categoria_id || '';
        document.getElementById('edit-preco').value = produto.preco;
        document.getElementById('edit-estoque').value = produto.estoque;
        document.getElementById('edit-estoque_minimo').value = produto.estoque_minimo || '';
        document.getElementById('edit-descricao').value = produto.descricao || '';
        
        // Abrir modal de edição
        const modalEl = document.getElementById('modalEditarProduto');
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    } catch (error) {
        console.error('Erro ao carregar produto para edição:', error);
        mostrarAlerta('Erro ao carregar dados do produto', 'danger');
    }
}

// Função para atualizar produto
async function atualizarProduto() {
    // Obter ID do produto
    const id = document.getElementById('edit-id').value;
    
    // Obter dados do formulário
    const codigo = document.getElementById('edit-codigo').value.trim();
    const nome = document.getElementById('edit-nome').value.trim();
    const categoria_id = parseInt(document.getElementById('edit-categoria').value);
    const preco = parseFloat(document.getElementById('edit-preco').value);
    const estoque = parseInt(document.getElementById('edit-estoque').value);
    const estoque_minimo = parseInt(document.getElementById('edit-estoque_minimo').value) || 5;
    const descricao = document.getElementById('edit-descricao').value.trim();
    
    // Validar campos obrigatórios
    if (!codigo || !nome || !categoria_id || isNaN(preco) || isNaN(estoque)) {
        mostrarAlerta('Preencha todos os campos obrigatórios', 'warning');
        return;
    }
    
    // Criar objeto do produto
    const produto = {
        codigo,
        nome,
        categoria_id,
        preco,
        estoque,
        estoque_minimo,
        descricao
    };
    
    try {
        // Atualizar produto
        await window.api.produtos.update(id, produto);
        
        // Fechar modal
        const modalEl = document.getElementById('modalEditarProduto');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        
        // Recarregar lista de produtos
        carregarProdutos();
        
        // Mostrar mensagem de sucesso
        mostrarAlerta('Produto atualizado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        mostrarAlerta('Erro ao atualizar produto. Tente novamente.', 'danger');
    }
}

// Função para confirmar exclusão
function confirmarExclusao(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        excluirProduto(id);
    }
}

// Função para excluir produto
async function excluirProduto(id) {
    try {
        // Verificar se há pedidos associados a este produto
        const pedidos = await window.api.pedidos.getAll();
        const temPedidos = pedidos.some(pedido => {
            return pedido.itens && pedido.itens.some(item => item.produto_id == id);
        });
        
        if (temPedidos) {
            mostrarAlerta("Não é possível excluir este produto pois existem pedidos associados a ele.", "warning");
            return;
        }
        
        // Excluir produto
        await window.api.produtos.delete(id);
        
        // Recarregar lista de produtos
        carregarProdutos();
        
        // Mostrar mensagem de sucesso
        mostrarAlerta('Produto excluído com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        mostrarAlerta('Erro ao excluir produto. Tente novamente.', 'danger');
    }
}

// Função para filtrar produtos
function filtrarProdutos() {
    const busca = document.getElementById('busca-produto').value.toLowerCase();
    const categoria_id = document.getElementById('filtro-categoria').value;
    
    // Carregar produtos do servidor e aplicar filtros
    carregarProdutosFiltrados(busca, categoria_id);
}

// Função para carregar produtos filtrados
async function carregarProdutosFiltrados(busca = '', categoria_id = '') {
    try {
        let produtos;
        
        if (categoria_id && categoria_id !== '') {
            // Filtrar por categoria específica
            produtos = await window.api.produtos.getByCategoria(categoria_id);
        } else {
            // Carregar todos os produtos
            produtos = await window.api.produtos.getAll();
        }
        
        // Aplicar filtro de busca se necessário
        if (busca) {
            produtos = produtos.filter(produto => 
                produto.nome.toLowerCase().includes(busca) || 
                produto.codigo.toLowerCase().includes(busca)
            );
        }
        
        renderizarProdutos(produtos);
    } catch (error) {
        console.error('Erro ao filtrar produtos:', error);
        mostrarAlerta('Erro ao filtrar produtos. Tente novamente.', 'danger');
    }
}

// Função para limpar filtros
function limparFiltros() {
    document.getElementById('busca-produto').value = '';
    document.getElementById('filtro-categoria').value = '';
    carregarProdutos();
}
