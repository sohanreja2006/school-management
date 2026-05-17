import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';

const generateChallenge = () => {
  const operators = ['+', '-', '×'];
  const op = operators[Math.floor(Math.random() * operators.length)];
  let a, b, answer;

  switch (op) {
    case '+':
      a = Math.floor(Math.random() * 40) + 5;
      b = Math.floor(Math.random() * 30) + 3;
      answer = a + b;
      break;
    case '-':
      a = Math.floor(Math.random() * 40) + 20;
      b = Math.floor(Math.random() * 15) + 2;
      answer = a - b;
      break;
    case '×':
      a = Math.floor(Math.random() * 9) + 2;
      b = Math.floor(Math.random() * 9) + 2;
      answer = a * b;
      break;
    default:
      a = 5; b = 3; answer = 8;
  }

  return { a, b, op, answer, text: `${a} ${op} ${b} = ?` };
};

const Captcha = ({ onVerify }) => {
  const [challenge, setChallenge] = useState(generateChallenge);
  const [userAnswer, setUserAnswer] = useState('');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const canvasRef = useRef(null);

  const drawCaptcha = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, w, h);

    // Noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `hsl(${Math.random() * 360}, 40%, 75%)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * w, Math.random() * h);
      ctx.lineTo(Math.random() * w, Math.random() * h);
      ctx.stroke();
    }

    // Noise dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 70%)`;
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Text
    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Slight rotation for each character
    const text = challenge.text;
    const startX = w / 2 - (text.length * 7);
    text.split('').forEach((char, i) => {
      ctx.save();
      const x = startX + i * 14;
      const y = h / 2 + (Math.random() * 6 - 3);
      const angle = (Math.random() - 0.5) * 0.3;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });
  }, [challenge]);

  useEffect(() => {
    drawCaptcha();
  }, [drawCaptcha]);

  const refreshCaptcha = () => {
    setChallenge(generateChallenge());
    setUserAnswer('');
    setVerified(false);
    setError(false);
    onVerify(false);
  };

  const handleVerify = () => {
    const num = parseInt(userAnswer, 10);
    if (num === challenge.answer) {
      setVerified(true);
      setError(false);
      onVerify(true);
    } else {
      setError(true);
      setVerified(false);
      setShakeKey(prev => prev + 1);
      onVerify(false);
      // Auto-refresh after wrong answer
      setTimeout(() => {
        refreshCaptcha();
      }, 1200);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleVerify();
    }
  };

  if (verified) {
    return (
      <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
        <ShieldCheck className="w-5 h-5 text-emerald-600" />
        <span className="text-sm font-semibold text-emerald-700">Captcha verified successfully</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Security Verification</label>
      <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
        <canvas
          ref={canvasRef}
          width={180}
          height={44}
          className="rounded-lg border border-gray-200 bg-white flex-shrink-0"
        />
        <button
          type="button"
          onClick={refreshCaptcha}
          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all flex-shrink-0"
          title="Refresh captcha"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <div className="flex-1 flex gap-2">
          <input
            type="number"
            value={userAnswer}
            onChange={(e) => { setUserAnswer(e.target.value); setError(false); }}
            onKeyDown={handleKeyDown}
            placeholder="Answer"
            className={`w-full px-3 py-2 bg-white border rounded-lg text-sm font-medium outline-none transition-all ${
              error ? 'border-red-400 ring-2 ring-red-100 animate-shake' : 'border-gray-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500'
            }`}
            key={`input-${shakeKey}`}
          />
          <button
            type="button"
            onClick={handleVerify}
            className="px-3 py-2 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 transition-all flex-shrink-0"
          >
            Verify
          </button>
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-500 font-medium">Wrong answer. Try again with a new challenge.</p>
      )}
    </div>
  );
};

export default Captcha;
