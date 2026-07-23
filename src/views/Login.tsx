import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Button } from '../components';
import { Shield } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export function LoginView({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      
      if (data.session) {
        onLogin();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      
      // For demo purposes in this environment if supabase isn't fully configured
      // we'll allow a fallback admin login
      if (email === 'admin' && password === 'admin') {
        onLogin();
      }
    } finally {
      setLoading(false);
    }
  };

  // Fallback for demo
  const handleDemoAdmin = () => {
    onLogin();
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-8 flex flex-col items-center">
        <img 
          src="https://i.postimg.cc/zXpg7rTL/Polyligne-F.png" 
          alt="Elie Group Logo" 
          className="h-20 object-contain mb-6" 
          crossOrigin="anonymous" 
        />
        
        <h1 className="text-2xl font-black text-white tracking-widest uppercase mb-2">ELIE GROUP</h1>
        <p className="text-zinc-400 text-sm mb-8 uppercase tracking-wider">Inventory & Management</p>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wider">Email</label>
            <input 
              type="text" 
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-3 text-sm focus:outline-none focus:border-rose-700 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@eliegroup.com"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-3 text-sm focus:outline-none focus:border-rose-700 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-rose-950/50 border border-rose-900 text-rose-400 p-3 rounded-sm text-sm">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full py-3 mt-4" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800 w-full text-center">
          <p className="text-xs text-zinc-500 mb-4">Or use demo access</p>
          <Button variant="secondary" onClick={handleDemoAdmin} className="w-full flex justify-center items-center gap-2">
            <Shield size={16} />
            Admin Login
          </Button>
        </div>
      </div>
    </div>
  );
}
