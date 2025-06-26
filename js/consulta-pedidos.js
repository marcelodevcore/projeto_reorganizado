// Script para a página de consulta de pedidos
document.addEventListener('DOMContentLoaded', function() {
    // Configurar eventos
    document.getElementById('btn-pesquisar').addEventListener('click', filtrarPedidos);
    document.getElementById('btn-limpar-filtros').addEventListener('click', limparFiltros);
    document.getElementById('btn-exportar-csv').addEventListener('click', exportarPedidosCSV);
    
    // Carregar produtos e fornecedores para os filtros
    carregarProdutosFiltro();
    carregarFornecedoresFiltro();
    
    // Configurar datas iniciais (último mês)
    const hoje = new Date();
    const mesPassado = new Date();
    mesPassado.setMonth(hoje.getMonth() - 1);
    
    document.getElementById('data-inicio').value = mesPassado.toISOString().split('T')[0];
    document.getElementById('data-fim').value = hoje.toISOString().split('T')[0];
});

// Função para carregar produtos no filtro
async function carregarProdutosFiltro() {
    try {
        const produtos = await window.api.produtos.getAll();
        const select = document.getElementById('filtro-produto');
        
        if (!produtos || produtos.length === 0) {
            select.innerHTML = '<option value="">Nenhum produto cadastrado</option>';
            return;
        }
        
        let options = '<option value="">Todos os produtos</option>';
        produtos.forEach(produto => {
            options += `<option value="${produto.id}">${produto.nome} (${produto.codigo})</option>`;
        });
        
        select.innerHTML = options;
    } catch (error) {
        console.error('Erro ao carregar produtos para filtro:', error);
    }
}

// Função para carregar fornecedores no filtro
async function carregarFornecedoresFiltro() {
    try {
        const fornecedores = await window.api.fornecedores.getAll();
        const select = document.getElementById('filtro-fornecedor');
        
        if (!fornecedores || fornecedores.length === 0) {
            select.innerHTML = '<option value="">Nenhum fornecedor cadastrado</option>';
            return;
        }
        
        let options = '<option value="">Todos os fornecedores</option>';
        fornecedores.forEach(fornecedor => {
            options += `<option value="${fornecedor.id}">${fornecedor.nome}</option>`;
        });
        
        select.innerHTML = options;
    } catch (error) {
        console.error('Erro ao carregar fornecedores para filtro:', error);
    }
}

// Função para filtrar pedidos
async function filtrarPedidos() {
    // Obter valores dos filtros
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;
    const produtoId = document.getElementById('filtro-produto').value;
    const fornecedorId = document.getElementById('filtro-fornecedor').value;
    
    // Criar objeto de filtros
    const filtros = {
        dataInicio,
        dataFim,
        produtoId,
        fornecedorId
    };
    
    try {
        // Buscar pedidos com filtros
        const pedidos = await window.api.pedidos.search(filtros);
        
        // Renderizar resultados
        renderizarResultados(pedidos);
        
    } catch (error) {
        console.error('Erro ao filtrar pedidos:', error);
        mostrarAlerta('Erro ao buscar pedidos. Tente novamente.', 'danger');
    }
}

// Função para renderizar resultados
function renderizarResultados(pedidos) {
    const tbody = document.getElementById('resultados-pedidos');
    
    if (!pedidos || pedidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum pedido encontrado com os filtros selecionados</td></tr>';
        return;
    }
    
    let html = '';
    pedidos.forEach(pedido => {
        // Contar itens do pedido (soma das quantidades)
        const quantidadeItens = pedido.itens
            ? pedido.itens.reduce((soma, item) => soma + (item.quantidade || 0), 0)
            : 0;
        
        html += `
            <tr>
                <td>${pedido.id}</td>
                <td>${formatarData(pedido.data)}</td>
                <td>${pedido.fornecedor_nome}</td>
                <td>${quantidadeItens} item(s)</td>
                <td>${formatarMoeda(pedido.valor_total)}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-outline-success" onclick="verDetalhesPedido(${pedido.id})">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Função para limpar filtros
function limparFiltros() {
    // Limpar campos de filtro
    document.getElementById('data-inicio').value = '';
    document.getElementById('data-fim').value = '';
    document.getElementById('filtro-produto').value = '';
    document.getElementById('filtro-fornecedor').value = '';
    
    // Limpar resultados
    document.getElementById('resultados-pedidos').innerHTML = '<tr><td colspan="6" class="text-center">Use os filtros acima para buscar pedidos</td></tr>';
}

// Função para exportar pedidos para CSV
async function exportarPedidosCSV() {
    // Obter valores dos filtros
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;
    const produtoId = document.getElementById('filtro-produto').value;
    const fornecedorId = document.getElementById('filtro-fornecedor').value;
    
    // Criar objeto de filtros
    const filtros = {
        dataInicio,
        dataFim,
        produtoId,
        fornecedorId
    };
    
    try {
        // Buscar pedidos com filtros
        const pedidos = await window.api.pedidos.search(filtros);
        
        if (!pedidos || pedidos.length === 0) {
            mostrarAlerta('Não há dados para exportar', 'warning');
            return;
        }
        
        // Preparar dados para CSV
        const dadosCSV = [];
        
        pedidos.forEach(pedido => {
            if (pedido.itens && pedido.itens.length > 0) {
                // Para cada item do pedido, criar uma linha no CSV
                pedido.itens.forEach(item => {
                    // Tratar separadores de milhar e decimais brasileiros corretamente
                    function parseValor(valor) {
                        if (typeof valor === 'string') {
                            if (valor.includes(',')) {
                                // Formato brasileiro: remove pontos (milhar) e troca vírgula por ponto (decimal)
                                valor = valor.replace(/\./g, '').replace(',', '.');
                            }
                            // Se não tem vírgula, já está no formato correto (padrão JS), não remover nada
                        }
                        return parseFloat(valor) || 0;
                    }
                    function duasCasas(valor) {
                        // Garante duas casas decimais, cortando sem arredondar para cima
                        valor = String(valor);
                        if (valor.includes('.')) {
                            const [int, dec] = valor.split('.');
                            return dec.length > 2 ? `${int}.${dec.slice(0,2)}` : (dec.length === 1 ? `${int}.${dec}0` : valor);
                        }
                        return valor + '.00';
                    }
                    let quantidade = parseValor(item.quantidade);
                    let precoUnitario = parseValor(item.preco_unitario);
                    let totalItem = quantidade * precoUnitario;
                    
                    dadosCSV.push({
                        'ID Pedido': pedido.id,
                        'Data': formatarData(pedido.data),
                        'Fornecedor': pedido.fornecedor_nome,
                        'Produto': item.produto_nome,
                        'Quantidade': quantidade,
                        'Preço Unitário': formatarMoeda(precoUnitario),
                        'Total Item': formatarMoeda(totalItem),
                        'Observações': pedido.observacoes || ''
                    });
                });
            } else {
                // Pedido sem itens
                dadosCSV.push({
                    'ID Pedido': pedido.id,
                    'Data': formatarData(pedido.data),
                    'Fornecedor': pedido.fornecedor_nome,
                    'Produto': '',
                    'Quantidade': '',
                    'Preço Unitário': '',
                    'Total Item': '',
                    'Observações': pedido.observacoes || ''
                });
            }
        });
        
        // Exportar para CSV
        exportarCSV(dadosCSV, 'pedidos.csv');
        
        mostrarAlerta('Dados exportados com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao exportar pedidos:', error);
        mostrarAlerta('Erro ao exportar dados. Tente novamente.', 'danger');
    }
}

// Função para exportar dados para CSV
function exportarCSV(dados, nomeArquivo) {
    if (dados.length === 0) return;
    
    // Obter cabeçalhos
    const headers = Object.keys(dados[0]);
    
    // Criar conteúdo CSV
    let csvContent = headers.join(',') + '\n';
    
    dados.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            // Escapar vírgulas e aspas
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvContent += values.join(',') + '\n';
    });
    
    // Criar blob e download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', nomeArquivo);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Função para ver detalhes do pedido
async function verDetalhesPedido(id) {
    try {
        // Buscar pedido pelo ID
        const pedido = await window.api.pedidos.getById(id);
        
        if (!pedido) {
            mostrarAlerta('Pedido não encontrado', 'warning');
            return;
        }
        
        // Preencher modal de detalhes
        document.getElementById('detalhe-id').textContent = pedido.id;
        document.getElementById('detalhe-data').textContent = formatarData(pedido.data);
        document.getElementById('detalhe-fornecedor').textContent = pedido.fornecedor_nome;
        document.getElementById('detalhe-valor-total').textContent = formatarMoeda(pedido.valor_total);
        document.getElementById('detalhe-observacoes').textContent = pedido.observacoes || 'Nenhuma observação';
        
        // Renderizar itens do pedido
        renderizarItensDetalhes(pedido.itens || []);
        
        // Abrir modal de detalhes
        const modalEl = document.getElementById('modalDetalhesPedido');
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    } catch (error) {
        console.error('Erro ao carregar detalhes do pedido:', error);
        mostrarAlerta('Erro ao carregar detalhes do pedido', 'danger');
    }
}

// Função para renderizar itens nos detalhes
function renderizarItensDetalhes(itens) {
    const tbody = document.getElementById('detalhe-itens');
    
    if (!itens || itens.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Nenhum item encontrado</td></tr>';
        return;
    }
    
    let html = '';
    itens.forEach(item => {
        html += `
            <tr>
                <td>${item.produto_nome}</td>
                <td>${item.quantidade}</td>
                <td>${formatarMoeda(item.preco_unitario)}</td>
                <td>${formatarMoeda(item.quantidade * item.preco_unitario)}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Função para mostrar alerta
function mostrarAlerta(mensagem, tipo) {
    // Criar elemento de alerta
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
    alerta.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alerta.innerHTML = `
        ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(alerta);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (alerta.parentNode) {
            alerta.parentNode.removeChild(alerta);
        }
    }, 5000);
}

// Função para formatar data
function formatarData(data) {
    if (!data) return '';
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR');
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
