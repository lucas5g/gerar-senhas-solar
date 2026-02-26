import { chromium } from 'playwright';
import { createServer } from 'http';

/**
 * Função responsável por navegar e gerar senhas em uma aba já autenticada
 */
async function gerarSenhas(workerPage: any, indexUsuario: number, quantidadeDeSenhas: number, comarca: string, predio: string, baseUrl: string) {
  const inicioTotal = Date.now();

  for (let count = 1; count <= quantidadeDeSenhas; count++) {
    await workerPage.goto(`https://${baseUrl}/atendimento/recepcao/novo-painel/comarca/${comarca}/predio/${predio}/?aba=senhas`);

    // Comandos de clique para gerar a senha
    await workerPage.getByRole('button', { name: ' Senha' }).click();
    await workerPage.getByRole('link', { name: 'Novo Atendimento' }).click();
    await workerPage.getByRole('button', { name: ' SEM PRIORIDADE' }).first().click();
    await workerPage.waitForTimeout(300);
  }

  const fimTotal = Date.now();
  const tempoEmSegundos = ((fimTotal - inicioTotal) / 1000).toFixed(2);
  return {
    usuario: indexUsuario + 1,
    senhas: quantidadeDeSenhas,
    tempo: tempoEmSegundos
  };
}

/**
 * Função responsável por criar as instâncias do navegador, logar e disparar os fluxos
 */
async function gerarUsuarios(
  numeroDeAbas: number,
  quantidadeDeSenhas: number,
  cpf: string,
  senhaCpf: string,
  comarca: string,
  predio: string,
  baseUrl: string,
  onLog: (msg: string) => void,
  onResult: (result: any) => void
) {
  const inicioGeral = Date.now();
  const browser = await chromium.launch({ headless: true });
  try {
    const promessasDeUsuarios = Array.from({ length: numeroDeAbas }).map(async (_, indexUsuario) => {
      const context = await browser.newContext();
      const workerPage = await context.newPage();

      try {
        await workerPage.goto(`https://${baseUrl}/login/?next=/`);
        await workerPage.getByRole('textbox', { name: 'Digite seu CPF' }).fill(cpf);
        await workerPage.getByRole('textbox', { name: 'Digite sua senha' }).click();
        await workerPage.getByRole('textbox', { name: 'Digite sua senha' }).fill(senhaCpf);
        await workerPage.getByRole('textbox', { name: 'Digite sua senha' }).press('Enter');

        await workerPage.waitForTimeout(1000);

        const result = await gerarSenhas(workerPage, indexUsuario, quantidadeDeSenhas, comarca, predio, baseUrl);
        console.log(`Usuário ${result.usuario} finalizou a geração de senhas em ${result.tempo}s`);
        onResult(result);
      } catch (err: any) {
        onLog(`Erro no usuário ${indexUsuario + 1}: ${err.message}`);
      } finally {
        await context.close();
      }
    });

    await Promise.all(promessasDeUsuarios);
  } finally {
    await browser.close();
  }
  const fimGeral = Date.now();
  return ((fimGeral - inicioGeral) / 1000).toFixed(2);
}

const HTML_CONTENT = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Gerador de Senhas</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0f172a;
      --surface: #1e293b;
      --primary: #3b82f6;
      --primary-hover: #2563eb;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --border: #334155;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem 1rem;
    }
    .container {
      width: 100%;
      max-width: 600px;
      background-color: var(--surface);
      border-radius: 12px;
      padding: 2.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.25);
      border: 1px solid var(--border);
    }
    h1 { margin-bottom: 0.5rem; font-size: 1.75rem; font-weight: 800; text-align: center; }
    p.subtitle { text-align: center; color: var(--text-muted); margin-bottom: 2rem; font-size: 0.95rem; }
    
    .form-group { margin-bottom: 1.5rem; }
    label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; color: var(--text); }
    input[type="number"],
    input[type="text"],
    input[type="password"] {
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      border: 1px solid var(--border);
      background-color: var(--bg);
      color: var(--text);
      font-size: 1rem;
      outline: none;
      transition: all 0.2s;
    }
    input[type="number"]:focus,
    input[type="text"]:focus,
    input[type="password"]:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }
    button {
      width: 100%;
      padding: 0.875rem;
      border-radius: 8px;
      border: none;
      background-color: var(--primary);
      color: white;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    button:hover { background-color: var(--primary-hover); }
    button:disabled { background-color: var(--border); cursor: not-allowed; color: var(--text-muted); }
    
    .results-container {
      margin-top: 3rem;
      width: 100%;
      max-width: 700px;
      display: none;
    }
    .results-container.active { display: block; }
    
    table {
      width: 100%;
      border-collapse: collapse;
      background-color: var(--surface);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border);
    }
    th, td { padding: 1rem; text-align: left; }
    th { background-color: rgba(0,0,0,0.2); font-weight: 600; font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); }
    tr { border-bottom: 1px solid var(--border); }
    tr:last-child { border-bottom: none; }
    
    .status {
      margin-top: 1rem;
      text-align: center;
      font-size: 0.9rem;
      color: var(--primary);
      height: 1.5rem;
    }
    .loader {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 2px solid var(--primary);
      border-bottom-color: transparent;
      border-radius: 50%;
      animation: rotation 1s linear infinite;
      vertical-align: middle;
      margin-right: 0.5rem;
    }
    @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>

  <div class="container">
    <h1>Gerador de Senhas</h1>
    <p class="subtitle">Automatização de acesso via Playwright</p>
    
    <div class="form-group">
      <label for="baseUrl">Ambiente (Base URL)</label>
      <input type="text" id="baseUrl" value="dev.solar.mg.def.br">
    </div>
    
    <div class="form-group">
      <label for="comarca">Comarca</label>
      <input type="text" id="comarca" value="1">
    </div>
    
    <div class="form-group">
      <label for="predio">Prédio</label>
      <input type="text" id="predio" value="133">
    </div>
    
    <div class="form-group">
      <label for="cpf">CPF</label>
      <input type="text" id="cpf" placeholder="Apenas números">
    </div>
    
    <div class="form-group">
      <label for="senha">Senha</label>
      <input type="password" id="senha" placeholder="Sua senha">
    </div>

    <div class="form-group">
      <label for="numeroAbas">Número de Abas (Usuários simultâneos)</label>
      <input type="number" id="numeroAbas" value="15" min="1" max="100">
    </div>
    
    <div class="form-group">
      <label for="quantidadeSenhas">Quantidade de Senhas por Aba</label>
      <input type="number" id="quantidadeSenhas" value="3" min="1" max="100">
    </div>
    
    <button id="btnStart" onclick="startGeneration()">Iniciar Geração</button>
    <div class="status" id="statusText"></div>
  </div>

  <div class="results-container" id="resultsContainer">
    <table>
      <thead>
        <tr>
          <th>Usuário</th>
          <th>Senhas Geradas</th>
          <th>Tempo Total (s)</th>
        </tr>
      </thead>
      <tbody id="resultsBody">
      </tbody>
    </table>
  </div>

  <script>
    let evtSource = null;

    async function startGeneration() {
      const cpf = document.getElementById('cpf').value;
      const senha = document.getElementById('senha').value;
      const numeroAbas = document.getElementById('numeroAbas').value;
      const quantidadeSenhas = document.getElementById('quantidadeSenhas').value;
      const comarca = document.getElementById('comarca').value;
      const predio = document.getElementById('predio').value;
      const baseUrl = document.getElementById('baseUrl').value;
      const btn = document.getElementById('btnStart');
      const statusText = document.getElementById('statusText');
      const resultsContainer = document.getElementById('resultsContainer');
      const resultsBody = document.getElementById('resultsBody');

      btn.disabled = true;
      btn.innerText = 'Processando...';
      resultsBody.innerHTML = '';
      resultsContainer.classList.add('active');
      statusText.innerHTML = '<span class="loader"></span> Inicializando navegadores...';

      if (evtSource) {
        evtSource.close();
      }

      try {
        const res = await fetch('/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            numeroDeAbas: parseInt(numeroAbas),
            quantidadeDeSenhas: parseInt(quantidadeSenhas),
            cpf: cpf,
            senha: senha,
            comarca: comarca,
            predio: predio,
            baseUrl: baseUrl
          })
        });
        
        if (!res.ok) {
          throw new Error('Falha ao iniciar processo');
        }

        evtSource = new EventSource('/events');
        
        evtSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          if (data.type === 'log') {
            const tr = document.createElement('tr');
            tr.innerHTML = \`
              <td colspan="3" style="color: #ef4444; font-size: 0.85rem;">\${data.message}</td>
            \`;
            resultsBody.appendChild(tr);
          } else if (data.type === 'result') {
            const tr = document.createElement('tr');
            tr.innerHTML = \`
              <td>Usuário \${data.data.usuario}</td>
              <td>\${data.data.senhas}</td>
              <td>\${data.data.tempo}</td>
            \`;
            resultsBody.appendChild(tr);
          } else if (data.type === 'done') {
            evtSource.close();
            btn.disabled = false;
            btn.innerText = 'Iniciar Novamente';
            const tempoStr = data.data && data.data.tempoTotal ? \` em \${data.data.tempoTotal}s\` : '';
            statusText.innerHTML = \`✅ Processo finalizado com sucesso\${tempoStr}!\`;

            if (data.data && data.data.tempoTotal) {
              const tr = document.createElement('tr');
              tr.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
              tr.innerHTML = \`
                <td colspan="2" style="font-weight: bold; text-align: right;">TEMPO TOTAL:</td>
                <td style="font-weight: bold; color: var(--primary);">\${data.data.tempoTotal} s</td>
              \`;
              resultsBody.appendChild(tr);
            }
          }
        };

        evtSource.onerror = () => {
          evtSource.close();
          btn.disabled = false;
          btn.innerText = 'Iniciar Novamente';
          statusText.innerHTML = '❌ Erro de conexão com o servidor. Verifique o terminal.';
        };

      } catch (err) {
        btn.disabled = false;
        btn.innerText = 'Iniciar Geração';
        statusText.innerHTML = '❌ ' + err.message;
      }
    }
  </script>
</body>
</html>
`;

let currentProcess: Promise<any> | null = null;
let eventClients: any[] = [];

function sendEventToClients(data: any) {
  for (const client of eventClients) {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  }
}

const server = createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML_CONTENT);
  } else if (req.method === 'GET' && req.url === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    eventClients.push(res);

    req.on('close', () => {
      eventClients = eventClients.filter(c => c !== res);
    });
  } else if (req.method === 'POST' && req.url === '/start') {
    if (currentProcess) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Um processo já está em andamento.' }));
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const params = JSON.parse(body);
        const numeroDeAbas = params.numeroDeAbas || 1;
        const quantidadeDeSenhas = params.quantidadeDeSenhas || 1;
        const cpf = params.cpf || '';
        const senha = params.senha || '';
        const comarca = params.comarca || '1';
        const predio = params.predio || '133';
        let baseUrl = params.baseUrl || 'dev.solar.mg.def.br';

        // Sanitizar a baseUrl caso o usuário tenha digitado com http/https ou barras no final
        baseUrl = baseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));

        console.log(`Iniciando ${numeroDeAbas} abas com ${quantidadeDeSenhas} senhas para o CPF ${cpf} (Ambiente: ${baseUrl}, Comarca: ${comarca}, Prédio: ${predio})...`);

        currentProcess = gerarUsuarios(
          numeroDeAbas,
          quantidadeDeSenhas,
          cpf,
          senha,
          comarca,
          predio,
          baseUrl,
          (msg) => sendEventToClients({ type: 'log', message: msg }),
          (result) => sendEventToClients({ type: 'result', data: result })
        ).then((tempoTotal) => {
          sendEventToClients({ type: 'done', data: { tempoTotal } });
          currentProcess = null;
          console.log(`Processo finalizado em ${tempoTotal}s.`);
        }).catch((err) => {
          sendEventToClients({ type: 'log', message: 'Erro no processo: ' + err.message });
          sendEventToClients({ type: 'done' });
          currentProcess = null;
          console.error(err);
        });

      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload inválido' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = 3030;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando!\nAcesse a interface em: http://localhost:${PORT}`);
});