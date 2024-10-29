const saldoInicial = document.getElementById('saldo-inicial');
const nomeCustoInput = document.getElementById('nome-custo');
const custoInput = document.getElementById('custo');
const listaCustos = document.getElementById('lista-custos');
const saldoFinalDisplay = document.getElementById('saldo-final');
const ctx = document.getElementById('grafico').getContext('2d');

let saldoFinal = 0;
let custos = [];
let chart;

function atualizarSaldoFinal() {
    saldoFinal = parseFloat(saldoInicial.value) - custos.reduce((total, custo) => total + custo.valor, 0);
    saldoFinalDisplay.textContent = `Saldo Final: R$ ${saldoFinal.toFixed(2)}`;
}

function adicionarCusto(nome, valor) {
    custos.push({ nome, valor });
    const row = document.createElement('tr');

    const nomeCell = document.createElement('td');
    nomeCell.textContent = nome;
    row.appendChild(nomeCell);

    const valorCell = document.createElement('td');
    valorCell.textContent = `R$ ${valor.toFixed(2)}`;
    row.appendChild(valorCell);

    const acaoCell = document.createElement('td');
    const removerBtn = document.createElement('button');
    removerBtn.textContent = 'Remover';
    removerBtn.addEventListener('click', () => removerCusto(valor, row));
    acaoCell.appendChild(removerBtn);
    row.appendChild(acaoCell);

    listaCustos.appendChild(row);
    atualizarSaldoFinal();
}

function removerCusto(valor, row) {
    custos = custos.filter(custo => custo.valor !== valor);
    listaCustos.removeChild(row);
    atualizarSaldoFinal();
}

document.getElementById('adicionar-custo').addEventListener('click', () => {
    const nomeCusto = nomeCustoInput.value.trim();
    const valorCusto = parseFloat(custoInput.value);

    if (nomeCusto && !isNaN(valorCusto) && valorCusto > 0) {
        adicionarCusto(nomeCusto, valorCusto);
        nomeCustoInput.value = '';
        custoInput.value = '';
    } else {
        alert('Por favor, insira um nome e um valor válido para o custo.');
    }
});

document.getElementById('plotar-grafico').addEventListener('click', () => {
    const labels = ['Saldo Inicial', ...custos.map(custo => custo.nome), 'Saldo Final'];
    const data = [parseFloat(saldoInicial.value), ...custos.map(custo => custo.valor), saldoFinal];

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Valores (R$)',
                data: data,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    ...new Array(custos.length).fill('rgba(255, 99, 132, 0.6)'),
                    'rgba(75, 192, 192, 0.6)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    ...new Array(custos.length).fill('rgba(255, 99, 132, 1)'),
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});

document.getElementById('salvar-pdf').addEventListener('click', async () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    pdf.text('Planilha de Saldo e Custos', 10, 10);

    let yPosition = 20;
    pdf.text(`Saldo Inicial: R$ ${parseFloat(saldoInicial.value).toFixed(2)}`, 10, yPosition);
    yPosition += 10;
    
    custos.forEach(custo => {
        pdf.text(`Custo: ${custo.nome} - Valor: R$ ${custo.valor.toFixed(2)}`, 10, yPosition);
        yPosition += 10;
    });

    pdf.text(`Saldo Final: R$ ${saldoFinal.toFixed(2)}`, 10, yPosition);
    yPosition += 20;

    const graficoCanvas = document.getElementById('grafico');
    const graficoImagem = await html2canvas(graficoCanvas);
    const graficoDataURL = graficoImagem.toDataURL('image/png');
    pdf.addImage(graficoDataURL, 'PNG', 10, yPosition, 180, 100);

    pdf.save('planilha_saldo_custos.pdf');
});


