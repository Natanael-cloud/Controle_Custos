// Seleciona elementos do DOM para manipulação
const saldoInicial = document.getElementById('saldo-inicial'); // Campo de entrada para o saldo inicial
const nomeCustoInput = document.getElementById('nome-custo');  // Campo de entrada para o nome do custo
const custoInput = document.getElementById('custo');           // Campo de entrada para o valor do custo
const listaCustos = document.getElementById('lista-custos');   // Elemento onde os custos adicionados serão exibidos em uma lista
const saldoFinalDisplay = document.getElementById('saldo-final'); // Elemento onde o saldo final será exibido
const ctx = document.getElementById('grafico').getContext('2d');  // Contexto do canvas para exibir o gráfico

// Variáveis iniciais
let saldoFinal = 0;   // Saldo final atualizado após os cálculos
let custos = [];      // Array para armazenar os custos
let chart;            // Variável para armazenar o gráfico e permitir sua atualização

// Função para atualizar o saldo final, subtraindo o total dos custos do saldo inicial
function atualizarSaldoFinal() {
    saldoFinal = parseFloat(saldoInicial.value) - custos.reduce((total, custo) => total + custo.valor, 0);
    saldoFinalDisplay.textContent = `Saldo Final: R$ ${saldoFinal.toFixed(2)}`;
}

// Função para adicionar um novo custo à lista
function adicionarCusto(nome, valor) {
    custos.push({ nome, valor });  // Adiciona o custo ao array `custos`
    const row = document.createElement('tr');  // Cria uma nova linha de tabela para o custo

    // Cria células de tabela para o nome e valor do custo
    const nomeCell = document.createElement('td');
    nomeCell.textContent = nome;
    row.appendChild(nomeCell);

    const valorCell = document.createElement('td');
    valorCell.textContent = `R$ ${valor.toFixed(2)}`;
    row.appendChild(valorCell);

    // Cria uma célula de ação com um botão para remover o custo
    const acaoCell = document.createElement('td');
    const removerBtn = document.createElement('button');
    removerBtn.textContent = 'Remover';
    removerBtn.addEventListener('click', () => removerCusto(valor, row));  // Remove o custo ao clicar
    acaoCell.appendChild(removerBtn);
    row.appendChild(acaoCell);

    listaCustos.appendChild(row);  // Adiciona a linha à lista de custos
    atualizarSaldoFinal();         // Atualiza o saldo final
}

// Função para remover um custo da lista e do saldo
function removerCusto(valor, row) {
    custos = custos.filter(custo => custo.valor !== valor);  // Remove o custo do array `custos`
    listaCustos.removeChild(row);                            // Remove a linha da lista de custos
    atualizarSaldoFinal();                                   // Atualiza o saldo final
}

// Event listener para adicionar um custo ao clicar no botão "Adicionar"
document.getElementById('adicionar-custo').addEventListener('click', () => {
    const nomeCusto = nomeCustoInput.value.trim();    // Obtém o nome do custo
    const valorCusto = parseFloat(custoInput.value);  // Obtém o valor do custo

    // Verifica se o nome e o valor são válidos antes de adicionar
    if (nomeCusto && !isNaN(valorCusto) && valorCusto > 0) {
        adicionarCusto(nomeCusto, valorCusto);  // Adiciona o custo
        nomeCustoInput.value = '';              // Limpa o campo do nome
        custoInput.value = '';                  // Limpa o campo do valor
    } else {
        alert('Por favor, insira um nome e um valor válido para o custo.');  // Alerta se os valores forem inválidos
    }
});

// Event listener para criar e exibir o gráfico ao clicar no botão "Plotar Gráfico"
document.getElementById('plotar-grafico').addEventListener('click', () => {
    const labels = ['Saldo Inicial', ...custos.map(custo => custo.nome), 'Saldo Final']; // Rótulos do gráfico
    const data = [parseFloat(saldoInicial.value), ...custos.map(custo => custo.valor), saldoFinal]; // Dados do gráfico

    if (chart) {
        chart.destroy();  // Destroi o gráfico atual, se existir, para criar um novo
    }

    // Cria um gráfico de barras usando Chart.js
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels, // Define os rótulos
            datasets: [{
                label: 'Valores (R$)',
                data: data,  // Define os dados
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)', // Cor para o saldo inicial
                    ...new Array(custos.length).fill('rgba(255, 99, 132, 0.6)'), // Cor para cada custo
                    'rgba(75, 192, 192, 0.6)' // Cor para o saldo final
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)', // Cor da borda do saldo inicial
                    ...new Array(custos.length).fill('rgba(255, 99, 132, 1)'), // Cor da borda de cada custo
                    'rgba(75, 192, 192, 1)' // Cor da borda do saldo final
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true // Define o eixo y começando do zero
                }
            }
        }
    });
});

// Event listener para salvar a planilha e o gráfico em um PDF
document.getElementById('salvar-pdf').addEventListener('click', async () => {
    const { jsPDF } = window.jspdf;  // Importa jsPDF
    const pdf = new jsPDF();         // Cria uma nova instância de PDF
    pdf.text('Planilha de Saldo e Custos', 10, 10); // Título do PDF

    let yPosition = 20; // Posição vertical inicial no PDF
    pdf.text(`Saldo Inicial: R$ ${parseFloat(saldoInicial.value).toFixed(2)}`, 10, yPosition);
    yPosition += 10;

    // Adiciona os custos ao PDF
    custos.forEach(custo => {
        pdf.text(`Custo: ${custo.nome} - Valor: R$ ${custo.valor.toFixed(2)}`, 10, yPosition);
        yPosition += 10;
    });

    pdf.text(`Saldo Final: R$ ${saldoFinal.toFixed(2)}`, 10, yPosition);
    yPosition += 20;

    // Captura e adiciona o gráfico como imagem no PDF
    const graficoCanvas = document.getElementById('grafico');
    const graficoImagem = await html2canvas(graficoCanvas); // Usa html2canvas para capturar o gráfico
    const graficoDataURL = graficoImagem.toDataURL('image/png');
    pdf.addImage(graficoDataURL, 'PNG', 10, yPosition, 180, 100); // Adiciona a imagem do gráfico no PDF

    pdf.save('planilha_saldo_custos.pdf'); // Salva o PDF com o nome especificado
});



