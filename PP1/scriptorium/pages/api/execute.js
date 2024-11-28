// pages/api/execute.js

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import util from 'util';

const execAsync = util.promisify(exec);

export default async function handler(req, res) {
  const { code, language, input } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  // Create a unique temporary directory
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'code-'));
  const fileExtension = getFileExtension(language);
  const filePath = path.join(tempDir, `Main.${fileExtension}`);

  try {
    // Write the code to a file
    fs.writeFileSync(filePath, code);

    // Handle input if provided
    if (input) {
      fs.writeFileSync(path.join(tempDir, 'input.txt'), input);
    }

    // Build the Docker command
    const dockerCommand = getDockerCommand(language, tempDir, filePath, input);

    // Execute the Docker command with a timeout
    const { stdout, stderr } = await execAsync(dockerCommand, { timeout: 5000 });

    res.status(200).json({
      output: stdout.trim(),
      error: stderr.trim() || null,
    });
  } catch (err) {
    res.status(500).json({
      error: 'Execution error',
      details: err.stderr || err.message,
    });
  } finally {
    // Clean up the temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

// Helper function to get the file extension based on the language
function getFileExtension(language) {
  switch (language.toLowerCase()) {
    case 'python':
      return 'py';
    case 'javascript':
      return 'js';
    case 'java':
      return 'java';
    case 'c':
      return 'c';
    case 'cpp':
      return 'cpp';
    case 'ruby':
      return 'rb';
    case 'go':
      return 'go';
    case 'php':
      return 'php';
    case 'csharp':
      return 'cs';
    case 'swift':
      return 'swift';
    default:
      throw new Error('Unsupported language');
  }
}

// Helper function to build the Docker command
function getDockerCommand(language, dirName, filePath, input) {
  const path = require('path');
  const fileName = path.basename(filePath);
  const resourceLimits = '--network none --cpus=".5" --memory="256m"';
  const inputCommand = input ? '< input.txt' : '';
  const baseCommand = `docker run ${resourceLimits} --rm -v "${dirName}":/app -w /app code-executor:latest bash -c`;

  switch (language.toLowerCase()) {
    case 'python':
      return `${baseCommand} "python3 ${fileName} ${inputCommand}"`;

    case 'javascript':
      return `${baseCommand} "node ${fileName} ${inputCommand}"`;

    case 'java':
      return `${baseCommand} "javac ${fileName} && java Main ${inputCommand}"`;

    case 'c':
      return `${baseCommand} "gcc ${fileName} -o main && ./main ${inputCommand}"`;

    case 'cpp':
      return `${baseCommand} "g++ ${fileName} -o main && ./main ${inputCommand}"`;

    case 'ruby':
      return `${baseCommand} "ruby ${fileName} ${inputCommand}"`;

    case 'go':
      return `${baseCommand} "go run ${fileName} ${inputCommand}"`;

    case 'php':
      return `${baseCommand} "php ${fileName} ${inputCommand}"`;

    case 'csharp':
      return `${baseCommand} "mv ${fileName} Program.cs && dotnet run ${inputCommand}"`;

    case 'swift':
      return `${baseCommand} "swift ${fileName} ${inputCommand}"`;

    default:
      throw new Error('Unsupported language');
  }
}

