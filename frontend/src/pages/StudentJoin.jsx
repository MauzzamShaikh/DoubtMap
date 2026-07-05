import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, ArrowLeft, Key, ShieldAlert } from 'lucide-react';

function StudentJoin() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const mountedRef = useRef(true);
  const readerId = 'qr-reader';

  useEffect(() => {
    localStorage.setItem('last_student_page', '/join');
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter a session code');
      return;
    }
    navigate(`/session/${code.trim().toUpperCase()}`);
  };

  const extractCodeFromUrl = (scannedText) => {
    // Our QR encodes a full URL like http://localhost:5173/session/ABC123
    try {
      const url = new URL(scannedText);
      const parts = url.pathname.split('/');
      return parts[parts.length - 1];
    } catch {
      // If it's not a URL, assume the raw text IS the code
      return scannedText;
    }
  };

  const startScanning = async () => {
    setError('');
    setScanning(true);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      const scanner = scannerRef.current;
      scannerRef.current = null;
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch (err) {
        console.error(err);
      }

      try {
        await scanner.clear();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const stopScanning = async () => {
    await stopScanner();
    if (mountedRef.current) {
      setScanning(false);
    }
  };

  const handleBack = async () => {
    await stopScanner();
    localStorage.removeItem('last_student_page');
    navigate('/');
  };

  useEffect(() => {
    if (!scanning) return;

    const html5QrCode = new Html5Qrcode(readerId);
    scannerRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 220 },
        (decodedText) => {
          const sessionCode = extractCodeFromUrl(decodedText);
          void (async () => {
            await stopScanner();
            navigate(`/session/${sessionCode.toUpperCase()}`);
          })();
        },
        () => {
          // ignore per-frame "no QR found" errors, they fire constantly
        }
      )
      .catch((err) => {
        console.error(err);
        setError('Could not access camera. Please allow camera permission.');
        setScanning(false);
      });

    return () => {
      stopScanner();
    };
  }, [scanning, navigate]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 p-4 transition-colors duration-300">
      {/* Background Decorative Glow Elements */}
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Back Link */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to roles
        </button>

        <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-slate-800/80">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">Join a Session</h1>
            <p className="text-sm text-slate-400 mt-1">Enter a lecture code or scan the teacher's QR code</p>
          </div>

          {scanning ? (
            <div className="flex flex-col gap-4">
              <div className="relative border border-slate-850 rounded-2xl overflow-hidden bg-slate-950 aspect-square">
                {/* Laser Scanning Line Animation */}
                <div className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-md shadow-cyan-400/50 animate-laser z-20" />
                <div id={readerId} className="w-full h-full" />
              </div>
              <button
                onClick={stopScanning}
                className="w-full py-3 rounded-2xl font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white transition-colors cursor-pointer"
              >
                Cancel Scan
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <button
                onClick={startScanning}
                className="group flex items-center justify-center gap-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-cyan-600/20 hover:shadow-cyan-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
              >
                <Camera className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Scan QR Code
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-slate-850" />
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">or enter code</span>
                <div className="flex-1 h-px bg-slate-850" />
              </div>

              <form onSubmit={handleJoin} className="flex flex-col gap-4">
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="ABC123"
                    className="w-full glass-input pl-12 pr-4 py-4 text-center text-2xl tracking-widest font-extrabold uppercase rounded-2xl focus:border-cyan-500/50 focus:ring-cyan-500/10 placeholder:text-slate-650"
                    maxLength={6}
                    required
                  />
                </div>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-450 text-xs rounded-xl p-3.5 text-center font-medium animate-fade-in flex items-center justify-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 py-3.5 rounded-2xl font-semibold hover:border-slate-700 hover:text-white transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  Join Session
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentJoin;
