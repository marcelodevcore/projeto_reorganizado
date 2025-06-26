// Funções globais e utilitárias para o sistema
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar tooltips do Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl, {
            customClass: 'custom-tooltip'
        });
    });
    
    // Inicializar popovers do Bootstrap
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
});

// Função para mostrar alertas
function mostrarAlerta(mensagem, tipo = 'success', duracao = 5000) {
    const alertaEl = document.getElementById('alertaMensagem');
    const mensagemEl = document.getElementById('mensagemTexto');
    
    if (!alertaEl || !mensagemEl) return;
    
    // Definir tipo de alerta
    alertaEl.className = `alert alert-${tipo} alert-dismissible fade show`;
    
    // Definir mensagem
    mensagemEl.textContent = mensagem;
    
    // Mostrar alerta
    alertaEl.classList.remove('d-none');
    
    // Esconder automaticamente após a duração especificada
    if (duracao > 0) {
        setTimeout(() => {
            alertaEl.classList.add('d-none');
        }, duracao);
    }
}

// Função para formatar moeda (R$)
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

// Função para formatar data
function formatarData(data) {
    if (!data) return '';
    
    const dataObj = new Date(data);
    return new Intl.DateTimeFormat('pt-BR').format(dataObj);
}

// Função para formatar CNPJ
function formatarCNPJ(cnpj) {
    if (!cnpj) return '';
    
    // Remover caracteres não numéricos
    cnpj = cnpj.replace(/\D/g, '');
    
    // Aplicar máscara
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

// Função para formatar telefone
function formatarTelefone(telefone) {
    if (!telefone) return '';
    
    // Remover caracteres não numéricos
    telefone = telefone.replace(/\D/g, '');
    
    // Aplicar máscara conforme o tamanho
    if (telefone.length === 11) {
        return telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (telefone.length === 10) {
        return telefone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }
    
    return telefone;
}

// Função para validar CNPJ
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    
    if (cnpj.length !== 14) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    // Validação do primeiro dígito verificador
    let soma = 0;
    let peso = 5;
    
    for (let i = 0; i < 12; i++) {
        soma += parseInt(cnpj.charAt(i)) * peso;
        peso = peso === 2 ? 9 : peso - 1;
    }
    
    let resto = soma % 11;
    let dv1 = resto < 2 ? 0 : 11 - resto;
    
    if (parseInt(cnpj.charAt(12)) !== dv1) return false;
    
    // Validação do segundo dígito verificador
    soma = 0;
    peso = 6;
    
    for (let i = 0; i < 13; i++) {
        soma += parseInt(cnpj.charAt(i)) * peso;
        peso = peso === 2 ? 9 : peso - 1;
    }
    
    resto = soma % 11;
    let dv2 = resto < 2 ? 0 : 11 - resto;
    
    return parseInt(cnpj.charAt(13)) === dv2;
}

// Função para exportar dados para CSV
function exportarCSV(dados, nomeArquivo) {
    if (!dados || !dados.length) {
        mostrarAlerta('Não há dados para exportar', 'warning');
        return;
    }
    
    // Obter cabeçalhos (propriedades do primeiro objeto)
    const cabecalhos = Object.keys(dados[0]);
    
    // Criar conteúdo CSV
    let conteudoCSV = cabecalhos.join(',') + '\n';
    
    // Adicionar linhas de dados
    dados.forEach(item => {
        const valores = cabecalhos.map(cabecalho => {
            const valor = item[cabecalho];
            // Tratar strings com vírgulas
            if (typeof valor === 'string' && valor.includes(',')) {
                return `"${valor}"`;
            }
            return valor;
        });
        
        conteudoCSV += valores.join(',') + '\n';
    });
    
    // Criar blob e link para download
    const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', nomeArquivo || 'dados.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Função para carregar dados iniciais no localStorage (apenas para desenvolvimento)
function carregarDadosIniciais() {
    // Verificar se já existem dados
    if (!localStorage.getItem('produtos')) {
        // Produtos iniciais
        const produtos = [
            { id: 1, codigo: 'P001', nome: 'Monitor LED 24"', categoria: 'Eletrônicos', preco: 899.90, estoque: 15, estoque_minimo: 5 },
            { id: 2, codigo: 'P002', nome: 'Teclado Mecânico', categoria: 'Periféricos', preco: 299.90, estoque: 30, estoque_minimo: 10 },
            { id: 3, codigo: 'P003', nome: 'Mouse Wireless', categoria: 'Periféricos', preco: 89.90, estoque: 25, estoque_minimo: 8 },
            { id: 4, codigo: 'P004', nome: 'Cadeira Gamer', categoria: 'Móveis', preco: 1299.90, estoque: 8, estoque_minimo: 3 },
            { id: 5, codigo: 'P005', nome: 'Headset Bluetooth', categoria: 'Periféricos', preco: 199.90, estoque: 12, estoque_minimo: 5 }
        ];
        localStorage.setItem('produtos', JSON.stringify(produtos));
    }
    
    if (!localStorage.getItem('fornecedores')) {
        // Fornecedores iniciais
        const fornecedores = [
            { id: 1, nome: 'Tech Solutions Ltda', cnpj: '12345678000190', cidade: 'São Paulo', estado: 'SP', telefone: '1133334444' },
            { id: 2, nome: 'Periféricos Express', cnpj: '98765432000121', cidade: 'Rio de Janeiro', estado: 'RJ', telefone: '2122223333' },
            { id: 3, nome: 'Móveis Corporativos SA', cnpj: '45678912000134', cidade: 'Belo Horizonte', estado: 'MG', telefone: '3144445555' }
        ];
        localStorage.setItem('fornecedores', JSON.stringify(fornecedores));
    }
    
    if (!localStorage.getItem('pedidos')) {
        // Pedidos iniciais
        const hoje = new Date();
        const ontem = new Date(hoje);
        ontem.setDate(hoje.getDate() - 1);
        const semanaPassada = new Date(hoje);
        semanaPassada.setDate(hoje.getDate() - 7);
        
        const pedidos = [
            { 
                id: 1, 
                data: hoje.toISOString().split('T')[0], 
                produtoId: 1, 
                produto: 'Monitor LED 24"', 
                quantidade: 2, 
                preco_unitario: 899.90, 
                valor_total: 1799.80, 
                fornecedorId: 1, 
                fornecedor: 'Tech Solutions Ltda' 
            },
            { 
                id: 2, 
                data: ontem.toISOString().split('T')[0], 
                produtoId: 3, 
                produto: 'Mouse Wireless', 
                quantidade: 5, 
                preco_unitario: 89.90, 
                valor_total: 449.50, 
                fornecedorId: 2, 
                fornecedor: 'Periféricos Express' 
            },
            { 
                id: 3, 
                data: semanaPassada.toISOString().split('T')[0], 
                produtoId: 4, 
                produto: 'Cadeira Gamer', 
                quantidade: 1, 
                preco_unitario: 1299.90, 
                valor_total: 1299.90, 
                fornecedorId: 3, 
                fornecedor: 'Móveis Corporativos SA' 
            }
        ];
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
    }
}

// Carregar dados iniciais quando a página carregar
document.addEventListener('DOMContentLoaded', carregarDadosIniciais);
