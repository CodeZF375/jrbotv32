
const readline = require('readline');
const { spawn } = require('child_process');
const path = require('path');

let botProcess = null;
let isRestarting = false;
let shellBusy = false;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '[BOT-CONSOLE] > '
});

function startBot() {
  if (botProcess) {
    console.log('Bot is already running.');
    return;
  }
  const botPath = path.join(__dirname, 'jrbot.js');
  botProcess = spawn('node', [botPath], {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  });

  botProcess.on('exit', (code, signal) => {
    console.log(`[BOT] Process exited with code ${code} (signal: ${signal})`);
    botProcess = null;
    if (isRestarting) {
      isRestarting = false;
      setTimeout(startBot, 1000); // Restart after 1 second
    }
  });

  botProcess.on('error', (err) => {
    console.error('[BOT] Failed to start:', err);
    botProcess = null;
  });

  console.log('[BOT] Started.');
}

function stopBot() {
  if (!botProcess) {
    console.log('Bot is not running.');
    return;
  }
  botProcess.kill();
  botProcess = null;
  console.log('[BOT] Stopped.');
}

function restartBot() {
  if (!botProcess) {
    console.log('Bot is not running. Starting...');
    startBot();
    return;
  }
  isRestarting = true;
  botProcess.kill();
  console.log('[BOT] Restarting...');
}

function statusBot() {
  if (botProcess) {
    console.log('[BOT] Status: RUNNING');
  } else {
    console.log('[BOT] Status: STOPPED');
  }
}

function showHelp() {
  console.log(`
Available commands:
/start      - Start the bot
/stop       - Stop the bot
/restart    - Restart the bot
/status     - Show bot status
/clear      - Clear the console output
/exit       - Exit this console
/help       - Show this help

You can also run any npm or node command, e.g.:
npm install discord.js
node somefile.js
  `);
}

function runShellCommand(cmd, args) {
  shellBusy = true;
  const child = spawn(cmd, args, { stdio: 'inherit', shell: true });
  child.on('exit', (code, signal) => {
    if (code !== 0) {
      console.log(`[SHELL] Process exited with code ${code} (signal: ${signal})`);
    }
    shellBusy = false;
    rl.prompt();
  });
  child.on('error', (err) => {
    console.error(`[SHELL] Failed to run command: ${err}`);
    shellBusy = false;
    rl.prompt();
  });
}

function clearConsole() {
  // Works cross-platform
  process.stdout.write('\x1Bc');
}

rl.prompt();

rl.on('line', (line) => {
  const input = line.trim();
  const cmd = input.toLowerCase();

  // Prevent new commands while a shell command is running
  if (shellBusy) {
    console.log('A shell command is currently running. Please wait...');
    return;
  }

  // Handle bot control commands
  switch (cmd) {
    case '/start':
      startBot();
      rl.prompt();
      return;
    case '/stop':
      stopBot();
      rl.prompt();
      return;
    case '/restart':
      restartBot();
      rl.prompt();
      return;
    case '/status':
      statusBot();
      rl.prompt();
      return;
    case '/clear':
      clearConsole();
      rl.prompt();
      return;
    case '/exit':
      if (botProcess) stopBot();
      rl.close();
      process.exit(0);
      return;
    case '/help':
      showHelp();
      rl.prompt();
      return;
  }

  // Handle npm/node commands
  if (input.startsWith('npm ') || input === 'npm') {
    const args = input.split(' ').slice(1);
    runShellCommand('npm', args);
    return;
  }
  if (input.startsWith('node ') || input === 'node') {
    const args = input.split(' ').slice(1);
    runShellCommand('node', args);
    return;
  }

  // Unknown command
  console.log('Unknown command. Type /help for a list of commands.');
  rl.prompt();
});

console.log('Bot Admin Console started. Type /help for commands.');
showHelp();
