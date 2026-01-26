import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ email, password });
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.role === 'admin') navigate('/admin/dashboard');
            else navigate('/shop/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="hidden lg:flex flex-col justify-center bg-primary p-12 text-primary-foreground relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/50 mix-blend-multiply z-0"></div>
                {/* Decorative circles */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-extrabold mb-6 tracking-tight">Digital. Secure. <br />Efficient.</h1>
                    <p className="text-lg opacity-80 leading-relaxed">
                        The official Government Shop Digital Notice Portal. Streamlining communication, document management, and compliance for a smarter future.
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-center p-8 bg-background">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-sm space-y-6"
                >
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
                        <p className="text-sm text-muted-foreground mt-2">Enter your credentials to access your dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20">{error}</div>}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                placeholder="admin@gov.in"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-muted/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-muted/30"
                            />
                        </div>
                        <Button className="w-full h-11 text-base shadow-lg shadow-primary/25" type="submit">Sign In to Dashboard</Button>
                    </form>

                    <div className="text-center text-xs text-muted-foreground mt-6">
                        Secure Government Portal v1.0
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
