import { spawn } from 'child_process';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { location } = req.body;

    const vlcProcess = spawn(process.env.VLC_PATH ? process.env.VLC_PATH : "", [location, "--fullscreen"]);

    vlcProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    vlcProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    vlcProcess.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });

    res.status(200).json({ message: 'VLC started successfully.' });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
