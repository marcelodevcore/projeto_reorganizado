// Script para a página de pedidos
document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados iniciais
    carregarFornecedores();
    carregarProdutos();
    
    // Configurar data atual no formulário
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('data').value = hoje;
    
    // Configurar eventos
    document.getElementById('btn-adicionar-item').addEventListener('click', abrirModalAdicionarItem);
    document.getElementById('btn-confirmar-item').addEventListener('click', adicionarItem);
    document.getElementById('btn-finalizar-pedido').addEventListener('click', finalizarPedido);
    document.getElementById('btn-cancelar').addEventListener('click', limparFormulario);
    
    // Eventos do modal
    document.getElementById('produto').addEventListener('change', atualizarPrecoEQuantidade);
    document.getElementById('quantidade').addEventListener('input', calcularTotalItem);
    document.getElementById('preco').addEventListener('input', calcularTotalItem);
});

// Array para armazenar itens do pedido
let itensPedido = [];

// Função para carregar fornecedores no select
async function carregarFornecedores() {
    try {
        const fornecedores = await window.api.fornecedores.getAll();
        const select = document.getElementById('fornecedor');
        
        if (!fornecedores || fornecedores.length === 0) {
            select.innerHTML = '<option value="">Nenhum fornecedor cadastrado</option>';
            return;
        }
        
        let options = '<option value="">Selecione um fornecedor...</option>';
        fornecedores.forEach(fornecedor => {
            options += `<option value="${fornecedor.id}">${fornecedor.nome}</option>`;
        });
        
        select.innerHTML = options;
    } catch (error) {
        console.error('Erro ao carregar fornecedores:', error);
        mostrarAlerta('Erro ao carregar lista de fornecedores', 'danger');
    }
}

// Função para carregar produtos no select
async function carregarProdutos() {
    try {
        const produtos = await window.api.produtos.getAll();
        const select = document.getElementById('produto');
        
        if (!produtos || produtos.length === 0) {
            select.innerHTML = '<option value="">Nenhum produto cadastrado</option>';
            return;
        }
        
        let options = '<option value="">Selecione um produto...</option>';
        produtos.forEach(produto => {
            options += `<option value="${produto.id}" data-preco="${produto.preco}" data-estoque="${produto.estoque}">${produto.nome} (${produto.codigo})</option>`;
        });
        
        select.innerHTML = options;
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        mostrarAlerta('Erro ao carregar lista de produtos', 'danger');
    }
}

// Função para abrir modal de adicionar item
function abrirModalAdicionarItem() {
    // Limpar formulário do modal
    document.getElementById('form-item').reset();
    document.getElementById('quantidade').value = '1';
    document.getElementById('estoque-disponivel').value = '';
    
    // Abrir modal
    const modal = new bootstrap.Modal(document.getElementById('modalAdicionarItem'));
    modal.show();
}

// Função para atualizar preço e quantidade disponível
function atualizarPrecoEQuantidade() {
    const produtoSelect = document.getElementById('produto');
    const precoInput = document.getElementById('preco');
    const estoqueInput = document.getElementById('estoque-disponivel');
    
    if (produtoSelect.value) {
        const option = produtoSelect.options[produtoSelect.selectedIndex];
        const preco = option.getAttribute('data-preco');
        const estoque = option.getAttribute('data-estoque');
        
        precoInput.value = preco;
        estoqueInput.value = estoque;
        
        // Calcular total do item
        calcularTotalItem();
    } else {
        precoInput.value = '';
        estoqueInput.value = '';
    }
}

// Função para calcular total do item
function calcularTotalItem() {
    const quantidade = parseInt(document.getElementById('quantidade').value) || 0;
    const preco = parseFloat(document.getElementById('preco').value) || 0;
    const total = quantidade * preco;
    
    // Atualizar total do item (se houver elemento para isso)
    const totalItemElement = document.getElementById('total-item');
    if (totalItemElement) {
        totalItemElement.textContent = formatarMoeda(total);
    }
}

// Função para adicionar item ao pedido
function adicionarItem() {
    const produtoSelect = document.getElementById('produto');
    const quantidadeInput = document.getElementById('quantidade');
    const precoInput = document.getElementById('preco');
    
    // Validar campos
    if (!produtoSelect.value) {
        mostrarAlerta('Selecione um produto', 'warning');
        return;
    }
    
    const quantidade = parseInt(quantidadeInput.value);
    const preco = parseFloat(precoInput.value);
    
    if (isNaN(quantidade) || quantidade <= 0) {
        mostrarAlerta('Quantidade deve ser maior que zero', 'warning');
        return;
    }
    
    if (isNaN(preco) || preco <= 0) {
        mostrarAlerta('Preço deve ser maior que zero', 'warning');
        return;
    }
    
    // Verificar estoque
    const estoqueDisponivel = parseInt(document.getElementById('estoque-disponivel').value);
    if (quantidade > estoqueDisponivel) {
        mostrarAlerta(`Estoque insuficiente. Disponível: ${estoqueDisponivel}`, 'warning');
        return;
    }
    
    // Verificar se produto já foi adicionado
    const produtoId = parseInt(produtoSelect.value);
    const itemExistente = itensPedido.find(item => item.produto_id === produtoId);
    
    if (itemExistente) {
        mostrarAlerta('Este produto já foi adicionado ao pedido', 'warning');
        return;
    }
    
    // Criar item
    const item = {
        produto_id: produtoId,
        produto_nome: produtoSelect.options[produtoSelect.selectedIndex].text,
        quantidade: quantidade,
        preco_unitario: preco,
        total: quantidade * preco
    };
    
    // Adicionar à lista
    itensPedido.push(item);
    
    // Atualizar tabela
    renderizarItensPedido();
    
    // Fechar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalAdicionarItem'));
    modal.hide();
    
    // Limpar formulário
    document.getElementById('form-item').reset();
    document.getElementById('quantidade').value = '1';
}

// Função para renderizar itens do pedido
function renderizarItensPedido() {
    const tbody = document.getElementById('itens-pedido');
    
    if (itensPedido.length === 0) {
        tbody.innerHTML = '<tr id="sem-itens"><td colspan="5" class="text-center">Nenhum item adicionado</td></tr>';
        document.getElementById('total-pedido').textContent = 'R$ 0,00';
        return;
    }
    
    // Remover linha "sem itens" se existir
    const semItens = document.getElementById('sem-itens');
    if (semItens) {
        semItens.remove();
    }
    
    let html = '';
    let totalPedido = 0;
    
    itensPedido.forEach((item, index) => {
        html += `
            <tr>
                <td>${item.produto_nome}</td>
                <td>${item.quantidade}</td>
                <td>${formatarMoeda(item.preco_unitario)}</td>
                <td>${formatarMoeda(item.total)}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="removerItem(${index})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        totalPedido += item.total;
    });
    
    tbody.innerHTML = html;
    document.getElementById('total-pedido').textContent = formatarMoeda(totalPedido);
}

// Função para remover item do pedido
function removerItem(index) {
    itensPedido.splice(index, 1);
    renderizarItensPedido();
}

// Função para finalizar pedido
async function finalizarPedido() {
    // Validar campos obrigatórios
    const data = document.getElementById('data').value;
    const fornecedorId = document.getElementById('fornecedor').value;
    const observacoes = document.getElementById('observacoes').value.trim();
    
    if (!data) {
        mostrarAlerta('Data é obrigatória', 'warning');
        return;
    }
    
    if (!fornecedorId) {
        mostrarAlerta('Fornecedor é obrigatório', 'warning');
        return;
    }
    
    if (itensPedido.length === 0) {
        mostrarAlerta('Adicione pelo menos um item ao pedido', 'warning');
        return;
    }
    
    // Criar objeto do pedido
    const pedido = {
        data: data,
        fornecedor_id: parseInt(fornecedorId),
        observacoes: observacoes,
        itens: itensPedido
    };
    
    try {
        // Salvar pedido
        await window.api.pedidos.create(pedido);
        
        // Mostrar mensagem de sucesso
        mostrarAlerta('Pedido registrado com sucesso!', 'success');
        
        // Limpar formulário
        limparFormulario();
        
    } catch (error) {
        console.error('Erro ao salvar pedido:', error);
        mostrarAlerta('Erro ao registrar pedido. Tente novamente.', 'danger');
    }
}

// Função para limpar formulário
function limparFormulario() {
    document.getElementById('form-pedido').reset();
    document.getElementById('data').value = new Date().toISOString().split('T')[0];
    itensPedido = [];
    renderizarItensPedido();
}

// Função para mostrar alerta
function mostrarAlerta(mensagem, tipo) {
    const alerta = document.getElementById('alertaMensagem');
    const mensagemTexto = document.getElementById('mensagemTexto');
    
    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    mensagemTexto.textContent = mensagem;
    alerta.classList.remove('d-none');
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        alerta.classList.add('d-none');
    }, 5000);
}

// Função para formatar moeda
function formatarMoeda(valor) {
    if (!valor && valor !== 0) return 'R$ 0,00';
    
    // Converter para número e garantir duas casas decimais
    const numero = parseFloat(valor);
    if (isNaN(numero)) return 'R$ 0,00';
    
    // Formatar manualmente para garantir vírgulas
    const valorFormatado = numero.toFixed(2).replace('.', ',');
    
    // Adicionar separadores de milhar
    const partes = valorFormatado.split(',');
    const parteInteira = partes[0];
    const parteDecimal = partes[1] || '00';
    
    // Adicionar pontos como separadores de milhar
    const parteInteiraFormatada = parteInteira.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `R$ ${parteInteiraFormatada},${parteDecimal}`;
}
