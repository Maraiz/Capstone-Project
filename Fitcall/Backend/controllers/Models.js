import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import supabase from '../lib/supabase.js';
import { v4 as uuidv4 } from 'uuid';

// Untuk ES module (__dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ultra Simple Helper Function
const handlePythonProcess = (python, res, tempFilePath = null) => {
  let output = '';
  let finished = false;
  let timeoutId = null;

  const finish = (data, code = 200) => {
    if (finished) {
      console.log('Already finished, skipping...');
      return;
    }
    
    finished = true;
    console.log('Finishing with code:', code);
    
    // Clear timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    
    // Cleanup file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log('Cleaned up:', tempFilePath);
      } catch (e) {
        console.warn('Cleanup failed:', e.message);
      }
    }
    
    // Kill process if still running
    try {
      if (python && !python.killed) {
        python.kill('SIGTERM');
      }
    } catch (e) {
      console.warn('Kill failed:', e.message);
    }
    
    // Send response ONLY if not sent
    try {
      if (!res.headersSent) {
        res.status(code).json(data);
      } else {
        console.log('Headers already sent, cannot respond');
      }
    } catch (e) {
      console.error('Response error:', e.message);
    }
  };

  // Collect output
  python.stdout.on('data', (data) => {
    if (!finished) {
      output += data.toString();
    }
  });

  // Ignore stderr completely - no logging
  python.stderr.on('data', () => {
    // Complete silence
  });
  
  // Handle close - ONCE only
  python.once('close', (code) => {
    console.log('Python process closed with code:', code);
    
    if (finished) {
      console.log('Already finished, ignoring close event');
      return;
    }

    if (code === 0 && output.trim()) {
      try {
        const result = JSON.parse(output.trim());
        finish(result, 200);
      } catch (e) {
        console.error('JSON parse error:', e.message);
        finish({error: 'Failed to parse Python output', details: e.message}, 500);
      }
    } else {
      finish({error: `Python process failed with code ${code}`, output: output.substring(0, 200)}, 500);
    }
  });

  // Handle error - ONCE only
  python.once('error', (err) => {
    console.error('Python process error:', err.message);
    finish({error: 'Failed to start Python process', details: err.message}, 500);
  });

  // Set timeout
  timeoutId = setTimeout(() => {
    console.log('Python process timeout');
    finish({error: 'Python script timeout (30s)'}, 500);
  }, 30000);
};

// Tabular prediction
export const predictTabular = (req, res) => {
  const features = req.body.features;

  if (!features || !Array.isArray(features)) {
    return res.status(400).json({
      error: 'Features array is required',
      status: 'error',
    });
  }

  try {
    const scriptPath = path.join(__dirname, '..', 'models', 'predict.py');
    const python = spawn('python', [scriptPath, JSON.stringify(features)], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    handlePythonProcess(python, res);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to start prediction',
      details: error.message,
      status: 'error'
    });
  }
};

// Image prediction
export const predictImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'Image file is required',
      status: 'error',
    });
  }

  let tempFilePath = null;

  try {
    // Create temp directory
    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Generate temp file
    const tempFileName = `temp_image_${uuidv4()}.jpg`;
    tempFilePath = path.join(tempDir, tempFileName);

    // Save file
    fs.writeFileSync(tempFilePath, req.file.buffer);
    console.log('Saved temp image:', tempFilePath);

    // Start Python process
    const scriptPath = path.join(__dirname, '..', 'models', 'predict.py');
    const python = spawn('python', [scriptPath, 'image', tempFilePath], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32'
    });

    handlePythonProcess(python, res, tempFilePath);

  } catch (error) {
    console.error('Image prediction error:', error.message);
    
    // Manual cleanup on error
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupErr) {
        console.warn('Manual cleanup failed:', cleanupErr.message);
      }
    }

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to process image',
        details: error.message,
        status: 'error',
      });
    }
  }
};