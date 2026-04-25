
import React, { useState, useEffect } from 'react';
import { Lock, Mail, ChevronRight, UserPlus, ShieldCheck, HelpCircle, RefreshCw, Smartphone } from 'lucide-react';
import { auth } from '../service/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [coName, setCoName] = useState('MNF HUB');
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
      // Load custom branding if available
      const savedLogo = localStorage.getItem('mnf_co_logo');
      const savedName = localStorage.getItem('mnf_co_name');
      if (savedLogo) setLogo(savedLogo);
      if (savedName) setCoName(savedName);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        if (email && password && name) {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(userCredential.user, { displayName: name });
          localStorage.setItem('mnf_role', isSuperAdmin ? 'super_admin' : 'admin');
          onLogin();
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        // Role is usually managed in DB, but for now we keep the local logic or assume admin
        localStorage.setItem('mnf_role', isSuperAdmin ? 'super_admin' : 'admin');
        onLogin();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = 'Ralat log masuk.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Email atau kata laluan salah.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Email sudah didaftarkan.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Kata laluan terlalu lemah (min 6 aksara).';
      }
      setError(msg);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      localStorage.setItem('mnf_role', 'admin');
      onLogin();
    } catch (err: any) {
      console.error('Google Auth error:', err);
      setError('Gagal log masuk dengan Google.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetSuccess('');
    setIsResetting(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess('Email reset kata laluan telah dihantar. Sila semak peti masuk anda.');
    } catch (err: any) {
      console.error('Reset error:', err);
      setError('Ralat: Email tidak dijumpai atau masalah rangkaian.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Neural Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900 rounded-full blur-[120px]"></div>
        <div className="w-full h-full pattern-dots opacity-10"></div>
      </div>

      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 relative z-10 border-b-[12px] border-slate-900 animate-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-24 h-24 bg-slate-900 text-cyan-400 rounded-3xl flex items-center justify-center font-black text-3xl mb-6 shadow-2xl shadow-cyan-500/20 transform rotate-3 hover:rotate-0 transition-transform cursor-default border-4 border-white overflow-hidden relative group">
             {logo ? (
                 <img src={logo} alt="Company Logo" className="w-full h-full object-cover bg-white" />
             ) : (
                 <span className="group-hover:scale-110 transition-transform duration-300">
                    {coName.charAt(0)}
                 </span>
             )}
          </div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-tight max-w-xs">
              {coName}
          </h1>
          <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] mt-2">
            {isSignUp ? 'Daftar Akaun Baru' : 'Akaun & Log Masuk Sistem'}
          </p>
          
          <div className="mt-4 flex items-center gap-2 bg-slate-100 p-1 rounded-full">
              <button 
                type="button"
                onClick={() => setIsSuperAdmin(false)}
                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${!isSuperAdmin ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}
              >
                  Admin
              </button>
              <button 
                type="button"
                onClick={() => setIsSuperAdmin(true)}
                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${isSuperAdmin ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400'}`}
              >
                  Super Admin
              </button>
          </div>
        </div>

        <form onSubmit={showForgotPassword ? handleForgotPassword : handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-[10px] font-bold uppercase tracking-widest p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          {resetSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-600 text-[10px] font-bold uppercase tracking-widest p-3 rounded-xl text-center">
              {resetSuccess}
            </div>
          )}

          {showForgotPassword ? (
            <div className="space-y-6">
               <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest flex items-center gap-2">
                  <Mail size={12} className="text-cyan-600" /> Email Akaun
                </label>
                <input 
                  type="email" 
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/5 transition-all font-bold text-sm"
                  placeholder="Masukkan email anda"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={isResetting}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-cyan-600 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95 group disabled:opacity-50 disabled:transform-none"
              >
                {isResetting ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" /> Menjana Kod...
                  </>
                ) : (
                  <>
                    Reset Kata Laluan <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              <button 
                type="button"
                onClick={() => {
                    setShowForgotPassword(false);
                    setError('');
                    setResetSuccess('');
                }}
                className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-cyan-600 transition-colors"
              >
                Kembali ke Log Masuk
              </button>
            </div>
          ) : (
            <>
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-600 ml-2 tracking-widest flex items-center gap-2">
                    <UserPlus size={14} className="text-cyan-600" /> Nama Penuh
                  </label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all font-bold text-sm placeholder:text-slate-300"
                    placeholder="Nama Anda"
                    required={isSignUp}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-600 ml-2 tracking-widest flex items-center gap-2">
                  <Mail size={14} className="text-cyan-600" /> Email
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all font-bold text-sm placeholder:text-slate-300"
                  placeholder="admin@mnf.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-2">
                  <label className="text-xs font-black uppercase text-slate-600 tracking-widest flex items-center gap-2">
                    <Lock size={14} className="text-cyan-600" /> Kata Laluan
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setShowForgotPassword(true)}
                    className="text-[10px] font-black text-cyan-600 uppercase hover:underline tracking-tight"
                  >
                    Forgot password?
                  </button>
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all font-bold text-sm placeholder:text-slate-300"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-cyan-600 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95 group"
              >
                {isSignUp ? 'Daftar Akaun' : 'Log Masuk'} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="h-px bg-slate-100 flex-1"></div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Atau</span>
                <div className="h-px bg-slate-100 flex-1"></div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-white border-2 border-slate-100 text-slate-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-sm hover:border-cyan-500/30 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Log Masuk dengan Google
              </button>
            </>
          )}
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center space-y-4">
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-cyan-600 transition-colors flex items-center justify-center gap-2 mx-auto group"
            >
              <UserPlus size={14} className="group-hover:scale-110 transition-transform" /> 
              {isSignUp ? 'Sudah ada akaun?' : 'Need an account?'} <span className="text-cyan-600 underline">{isSignUp ? 'Log Masuk' : 'Sign up'}</span>
            </button>
            
            <button 
              onClick={() => {
                if (window.confirm('Adakah anda pasti mahu memadam SEMUA email/akaun yang telah didaftarkan? Tindakan ini tidak boleh dikembalikan.')) {
                  localStorage.removeItem('mnf_users');
                  localStorage.removeItem('mnf_role');
                  localStorage.removeItem('mnf_auth');
                  alert('Semua akaun telah dipadam. Anda kini boleh mendaftar semula atau menggunakan akaun admin@mnf.com (admin123).');
                  window.location.reload();
                }
              }}
              className="text-[8px] font-bold text-red-400/50 uppercase tracking-widest hover:text-red-500 transition-colors mt-2"
            >
              Reset Database Pengguna
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 text-[8px] text-gray-300 font-bold uppercase tracking-widest">
            <ShieldCheck size={10} /> Neural Secured Connection v16.99
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
