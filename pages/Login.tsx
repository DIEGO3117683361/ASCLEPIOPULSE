import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useUser();
    const [phone, setPhone] = React.useState('');
    const [pin, setPin] = React.useState('');
    const [error, setError] = React.useState('');
    const [isSuspended, setIsSuspended] = React.useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSuspended(false);

        const result = await login(phone, pin);
        
        if (result.success) {
            navigate('/');
        } else {
            const reason = result.reason || 'Teléfono o PIN incorrectos.';
            setError(reason);
            if (reason.toLowerCase().includes('suspendida')) {
                setIsSuspended(true);
            }
        }
    };

    return (
        <div className="bg-graphite text-white min-h-screen flex flex-col p-4">
             <header className="flex items-center">
                <Link to="/welcome" className="p-2 -ml-2 mr-2">
                    <ArrowLeft />
                </Link>
                <h1 className="text-xl font-bold">Iniciar Sesión</h1>
            </header>
            
            <div className="flex-1 flex flex-col justify-center">
                <div className="text-center mb-8">
                     <KeyRound size={48} className="mx-auto text-accent-lime"/>
                     <h2 className="text-2xl font-bold mt-4">Bienvenido de vuelta</h2>
                     <p className="text-gray-400">Ingresa para continuar tu progreso.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto w-full">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-1">Número de teléfono</label>
                        <input 
                            type="tel" 
                            name="phone" 
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required 
                            className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-lime" 
                        />
                    </div>
                     <div>
                        <label htmlFor="pin" className="block text-sm font-medium text-gray-400 mb-1">PIN (4 dígitos)</label>
                        <input 
                            type="password" 
                            name="pin" 
                            id="pin"
                            maxLength={4}
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            required 
                            className="w-full bg-graphite-light border border-graphite-lighter rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-lime" 
                        />
                    </div>
                    
                    {error && (
                        <div className={`p-3 rounded-lg flex items-start text-sm ${isSuspended ? 'bg-red-500/20 text-red-300' : 'bg-orange-500/20 text-orange-300'}`}>
                           <AlertCircle size={20} className="mr-3 mt-0.5 flex-shrink-0"/> 
                           <div>
                                <span className="font-bold">{isSuspended ? 'Cuenta Suspendida' : 'Error de Ingreso'}</span>
                                <p>{error}</p>
                           </div>
                        </div>
                    )}


                    <button 
                        type="submit" 
                        className="w-full bg-accent-lime text-graphite font-bold py-4 rounded-lg transition hover:bg-lime-500"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
