// pages/api/execute.js
import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

export default async function handler(req, res) {
  const { code, language, input } = req.body;

  // Check if code is provided
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  // Define paths for temporary files
  const tempDir = os.tmpdir();
  const filePath = path.join(tempDir, `main.${language}`);
  const outputFile = path.join(tempDir, 'main');

  let compileCommand = null;
  let executeCommand = null;

  try {
    switch (language) {
      case 'python':
      
        executeCommand = ['python', '-c', code];
        break;

      case 'javascript':
        
        executeCommand = ['node', '-e', code];
        break;

      case 'java':
       
        fs.writeFileSync(`${tempDir}/Main.java`, code);
        compileCommand = `javac ${tempDir}/Main.java`;
        executeCommand = ['java', '-cp', tempDir, 'Main'];
        break;

      case 'c':
        
        fs.writeFileSync(filePath, code);
        compileCommand = `gcc ${filePath} -o ${outputFile}`;
        executeCommand = [outputFile];
        break;

      case 'cpp':
        
        fs.writeFileSync(filePath, code);
        compileCommand = `g++ ${filePath} -o ${outputFile}`;
        executeCommand = [outputFile];
        break;

      default:
        return res.status(400).json({ error: 'Unsupported language' });
    }

    
    if (compileCommand) {
      const compileResult = await new Promise((resolve, reject) => {
        exec(compileCommand, (error, stdout, stderr) => {
          if (error) reject(stderr || error.message);
          else resolve(stdout);
        });
      }).catch((compileError) => {
        return res.status(500).json({
          error: 'Compilation error',
          details: compileError,
        });
      });

      if (compileResult) {
        return; 
      }
    }

    const childProcess = spawn(executeCommand[0], executeCommand.slice(1));

   
    if (input) {
      childProcess.stdin.write(input + '\n'); // Important: Add newline for readline to detect end of input
      childProcess.stdin.end();
    }

    let output = '';
    let errorOutput = '';

    childProcess.stdout.on('data', (data) => {
      output += data.toString();
    });


    childProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    childProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({
          error: 'Runtime error',
          details: errorOutput,
          output: null,
        });
      }

      res.status(200).json({
        output: output,
        error: errorOutput || null,
      });
    });

  } catch (err) {
    res.status(500).json({ error: 'Execution error', details: err.message });
  }
}
