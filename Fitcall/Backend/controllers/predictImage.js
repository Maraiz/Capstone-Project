import sharp from 'sharp';
import supabase from '../lib/supabase.js';
import { v4 as uuidv4 } from 'uuid'; // untuk nama file unik

// Image prediction with in-memory buffer
export const predictImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'Image file is required',
      status: 'error',
    });
  }

  const scriptPath = path.join(__dirname, '..', 'models', 'predict.py');

  const python = spawn('python', [scriptPath, 'image'], {
    stdio: ['pipe', 'pipe', 'pipe'] // untuk kirim buffer lewat stdin
  });

  // Kirim image buffer ke Python stdin
  python.stdin.write(req.file.buffer);
  python.stdin.end();

  handlePythonProcess(python, res);
};

