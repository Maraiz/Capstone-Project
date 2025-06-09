import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Untuk ES module (__dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function untuk handle Python process
const handlePythonProcess = (python, res) => {
  let output = '';
  let responded = false;

  python.stdout.on('data', (data) => {
    output += data.toString();
  });

  python.stderr.on('data', (data) => {
    const errMsg = data.toString();
    console.error('Python stderr:', errMsg);

    const isRealError =
      errMsg.includes('Traceback') ||
      errMsg.toLowerCase().includes('error') ||
      errMsg.toLowerCase().includes('exception');

    if (!responded && isRealError) {
      responded = true;
      res.status(500).json({
        error: 'Model prediction failed: ' + errMsg,
        status: 'error',
      });
    }
  });

  python.on('close', () => {
    if (responded) return;

    try {
      const result = JSON.parse(output);
      responded = true;
      res.json(result);
    } catch (err) {
      responded = true;
      res.status(500).json({
        error: 'Failed to parse output: ' + err.message,
        status: 'error',
      });
    }
  });

  // Timeout handler
  setTimeout(() => {
    if (!responded) {
      responded = true;
      python.kill();
      res.status(500).json({
        error: 'Python script timeout',
        status: 'error',
      });
    }
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

  const scriptPath = path.join(__dirname, '..', 'models', 'predict.py');
  const python = spawn('python', [scriptPath, JSON.stringify(features)]);

  handlePythonProcess(python, res);
};

// Image prediction
export const predictImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'Image file is required',
      status: 'error',
    });
  }

  const imagePath = req.file.path;
  const scriptPath = path.join(__dirname, '..', 'models', 'predict.py');
  const python = spawn('python', [scriptPath, 'image', imagePath]);

  handlePythonProcess(python, res);
};