FROM oven/bun:debian

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Inicializa o projeto e instala as dependências via Bun
RUN bun init -y && \
    bun add playwright typescript @types/node

# Instala o navegador Chromium e todas as suas dependências do sistema do debian
RUN bunx playwright install --with-deps chromium

# Copia o código do projeto
COPY index.ts ./

# Expõe a porta que o servidor vai rodar (3030)
EXPOSE 3030

# Comando para iniciar a aplicação com bun
CMD ["bun", "index.ts"]
