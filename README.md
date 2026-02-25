# Gerador de Senhas Automatizado

Este é um script em Node.js com TypeScript que utiliza a biblioteca [Playwright](https://playwright.dev/) para automatizar o processo de login e geração de senhas no sistema `dev.solar.mg.def.br`. Ele possui uma interface web amigável para configurar e iniciar o processo de forma paralela.

## 🚀 Funcionalidades

- **Interface Web:** Um painel de controle via navegador para configurar os parâmetros da automação fácil e intuitivo.
- **Automação de Login:** Realiza o preenchimento de CPF e Senha de forma automática utilizando o Playwright.
- **Execução Paralela:** Abre múltiplas abas (simulando diversos usuários) para gerar as senhas simultaneamente.
- **Acompanhamento em Tempo Real:** Utiliza *Server-Sent Events (SSE)* para notificar o frontend sobre o tempo que cada usuário (aba) levou para gerar todas as senhas.

## 📋 Pré-requisitos

Certifique-se de ter os seguintes itens instalados no seu ambiente de desenvolvimento:
- [Node.js](https://nodejs.org/) (Versão 16 ou superior recomendada)
- Gerenciador de pacotes (`npm`, `yarn` ou `pnpm`)

## 🛠️ Instalação

1. Clone ou acesse o diretório do projeto:
\`\`\`bash
cd /caminho/para/o/projeto
\`\`\`

2. Instale as dependências essenciais:
\`\`\`bash
npm install playwright
npm install -D typescript tsx @types/node
\`\`\`

3. Instale os navegadores do Playwright (se ainda não tiver feito):
\`\`\`bash
npx playwright install chromium
\`\`\`

## 🏃 Como Executar

Como o script é feito em TypeScript (`index.ts`), a maneira mais fácil de rodá-lo é utilizando o pacote `tsx` ou `ts-node`.

1. Execute o servidor:
\`\`\`bash
npx tsx index.ts
\`\`\`

2. O terminal exibirá a seguinte mensagem:
\`\`\`text
🚀 Servidor rodando!
Acesse a interface em: http://localhost:3030
\`\`\`

3. Abra seu navegador e acesse `http://localhost:3030`.

## ⚙️ Como Utilizar a Interface

Na página web `http://localhost:3030`, você verá um formulário para preencher os seguintes dados:

- **CPF:** O CPF que será utilizado no login do sistema.
- **Senha:** A senha correspondente para a autenticação.
- **Número de Abas:** Define quantos usuários/contextos isolados serão abertos simultaneamente (Recomendação: cuidado ao usar números muito altos dependendo da capacidade da sua máquina).
- **Quantidade de Senhas por Aba:** O número de vezes que o fluxo de "Novo Atendimento -> SEM PRIORIDADE" rodará para cada um dos usuários.

Após configurar os valores, clique no botão **"Iniciar Geração"**. Uma tabela de resultados será exibida assim que as abas forem concluindo o processo de geração das senhas, detalhando o tempo investido em cada uma.

## ⚠️ Observações de Uso e Segurança

- A aplicação rodará com o navegador em modo visível (`headless: false` configurado pelo Playwright) para que você consiga visualizar os cliques acontecendo.
- Em ambientes de produção contínua, você pode alterar no `index.ts` o valor para `headless: true`.
- Certifique-se de que a plataforma destino (`dev.solar.mg.def.br`) comporta o volume de requisições paralelas que deseja testar para não causar sobrecarga (*DDoS* não intencional) no servidor deles.
- Nenhuma de suas credenciais (CPF/Senha) são salvas em bancos de dados ou arquivos neste projeto. O tráfego de dados acontece via memória transitória dentro da sua própria máquina local.
# gerar-senhas-solar
