import { authClient } from '../../lib/auth-client'

export default function Home() {
	const { data: session } = authClient.useSession()

	const handleSignIn = () => {
		authClient.signIn.social({ provider: 'discord', callbackURL: `${window.location.origin}/dashboard` })
	}

	return (
		<div className="blueprint-bg flex flex-col items-center justify-center h-full w-full">
			<div className="flex items-center gap-4 mb-4 w-full max-w-4xl px-8">
				<div className="flex-1 border-t-2 border-dashed border-white/50" />
				<span className="text-white/70 text-sm tracking-[0.3em] uppercase whitespace-nowrap">Technical Case Competition</span>
				<div className="flex-1 border-t-2 border-dashed border-white/50" />
			</div>

			<h1 className="font-bernoru text-white text-center uppercase leading-none mb-10"
				style={{ fontSize: 'clamp(2.5rem, 8vw, 7rem)' }}>
				Design &amp; Craft Sprint
			</h1>

			{!session && (
				<button
					onClick={handleSignIn}
					className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-lg"
				>
					Sign in with Discord
				</button>
			)}
		</div>
	)
}
