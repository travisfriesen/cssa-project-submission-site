import { authClient } from '../lib/auth-client'
import User from './User'

export default function Header() {
    const { data: session } = authClient.useSession()

    const handleDashboard = () => {
        window.location.href = '/dashboard';
    }

    return (
        <header className="flex flex-row items-center justify-between px-6 py-3 w-screen" style={{ backgroundColor: '#3d5091', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="text-white text-sm font-bernoru uppercase tracking-widest opacity-80">Design &amp; Craft Sprint</span>

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
                ) : null}
            </div>
        </header>
    )
}