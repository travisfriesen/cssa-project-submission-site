import { authClient } from '../lib/auth-client'
import User from './User'

export default function Header() {
    const { data: session } = authClient.useSession()

    const handleSignIn = () => {
        authClient.signIn.social({ provider: 'discord' })
    }

    const handleDashboard = () => {
        window.location.href = '/dashboard';
    }

    return (
        <header className="flex flex-row items-center justify-between px-6 py-3 bg-gray-900 shadow-md w-screen">
            <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Logo" className="w-10 h-10" />
                <span className="text-white text-xl font-bold">MyApp</span>
            </div>

            <div>
                {session ? (
                    <div className="flex items-center gap-2">
                        {window.location.pathname !== '/dashboard' && (
                            <button
                                onClick={handleDashboard}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                            >
                                Dashboard
                            </button>
                        )}

                        <User
                            id={session.user.name}
                            avatar={session.user.image}
                        />
                    </div>
                ) : (
                    <button
                        onClick={handleSignIn}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                        Sign in with Discord
                    </button>
                )}
            </div>
        </header>
    )
}