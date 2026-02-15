const { exec } = require('child_process');

// Kill any process using port 5000
const killCommand = 'powershell -Command "Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"';

console.log('🔍 Checking for processes on port 5000...');

exec(killCommand, (error) => {
  if (error) {
    console.log('⚠️  No process found on port 5000 or error checking:', error.message);
  } else {
    console.log('✅ Port 5000 cleared!');
  }
  
  // Small delay to ensure port is released
  setTimeout(() => {
    console.log('🚀 Starting server...\n');
    require('./server.js');
  }, 500);
});
