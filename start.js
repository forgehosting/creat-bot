const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Função para verificar se o arquivo do bot existe
function botFileExists(bot) {
    const filePath = path.join(bot.cwd, bot.script);
    return fs.existsSync(filePath);
}

// Função para verificar se as dependências já estão instaladas
function dependenciesInstalled(bot) {
    const nodeModulesPath = path.join(bot.cwd, 'node_modules');
    const packageLockPath = path.join(bot.cwd, 'package-lock.json');
    return fs.existsSync(nodeModulesPath) && fs.existsSync(packageLockPath);
}

// Função para instalar dependências e iniciar o bot
function startBot(bot) {
    if (!botFileExists(bot)) {
        console.log(`[${bot.name}] Arquivo ${bot.script} não encontrado. Pulando...`);
        return;
    }

    // Verifica se as dependências já estão instaladas
    if (!dependenciesInstalled(bot)) {
        console.log(`[${bot.name}] Instalando dependências...`);
        exec('npm install', { cwd: bot.cwd }, (err, stdout, stderr) => {
            if (err) {
                console.error(`[${bot.name}] Erro ao instalar dependências: ${err.message}`);
                return;
            }

            console.log(`[${bot.name}] Dependências instaladas. Iniciando...`);
            startBotProcess(bot);
        });
    } else {
        console.log(`[${bot.name}] Dependências já instaladas. Iniciando...`);
        startBotProcess(bot);
    }
}

// Função para iniciar o processo do bot
function startBotProcess(bot) {
    const process = exec(`node ${bot.script}`, { cwd: bot.cwd });

    process.stdout.on('data', (data) => {
        console.log(`[${bot.name}] ${data}`);
    });

    process.stderr.on('data', (data) => {
        console.error(`[${bot.name}] ${data}`);
    });

    process.on('close', (code) => {
        console.log(`[${bot.name}] Processo finalizado com código ${code}`);
    });
}

// Função para gerar a lista de bots com base no BOT_COUNT
function generateBotsList(botCount) {
    const bots = [];
    for (let i = 1; i <= botCount; i++) {
        bots.push({
            name: `Bot ${i}`,
            script: 'index.js',
            cwd: path.join(__dirname, `bot${i}`)
        });
    }
    return bots;
}

// Obter o número de bots da variável de ambiente BOT_COUNT
const BOT_COUNT = parseInt(process.env.BOT_COUNT) || 5; // Valor padrão é 5

// Gerar a lista de bots com base no BOT_COUNT
const bots = generateBotsList(BOT_COUNT);

// Iniciar todos os bots
bots.forEach(startBot);