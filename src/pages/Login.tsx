import { useState, useEffect } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebase";
import { motion } from "framer-motion";
import { LogIn, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      // After popup succeeds, AuthContext will take over.
      // We keep isLoading true until currentUser is set or an error occurs.
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to sign in");
      setIsLoading(false);
    }
  };

  const showLoading = isLoading || !!(isAuthLoading && auth.currentUser);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card max-w-md w-full p-8 rounded-2xl text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_30px_rgba(200,35,35,0.4)] mx-auto mb-6">
          <span className="font-display font-bold text-white text-3xl">H</span>
        </div>

        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Hood Report
        </h1>
        <p className="text-gray-400 mb-8">
          Sign in to access your creative workspace
        </p>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-start gap-3 text-left">
            <AlertCircle className="text-danger shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={showLoading}
          className="w-full py-3.5 px-4 bg-white text-black hover:bg-gray-100 rounded-xl font-medium transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          {showLoading ? "Signing in..." : "Continue with Google"}
        </button>
      </motion.div>
    </div>
  );
}
