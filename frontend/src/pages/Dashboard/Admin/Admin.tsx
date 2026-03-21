import { useEffect, useRef, useState } from "react";
import { authClient } from '../../../lib/auth-client'
import { useNavigate } from "react-router";

interface Submission {
	id: string;
	teamId: string;
	fileName: string;
	uploadedAt: Date;
}

export default function Admin() {
	const { data: session, isPending } = authClient.useSession();
	const navigate = useNavigate();
	const [submissions, setSubmissions] = useState<Submission[]>([]);
	const [activeTeam, setActiveTeam] = useState<string | null>(null);
	const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

	// @ts-expect-error trust me its there
	const uID: string | undefined = session?.user?.discordId;

	const adminIds = ["1145458761151033374", "707753613967229011", "259881984069730304"];
	const isAdmin = !isPending && !!session && !!uID && adminIds.includes(uID);

	useEffect(() => {
		if (!isAdmin) return;
		fetch(`${import.meta.env.VITE_BACKEND_URL}/api/submissions/`, {
			credentials: 'include'
		})
			.then(res => res.json())
			.then(data => setSubmissions(data.submissions ?? []))
			.catch(() => setSubmissions([]));
	}, [isAdmin]);

	const byTeam = submissions.reduce<Record<string, Submission[]>>((acc, sub) => {
		(acc[sub.teamId] ??= []).push(sub);
		return acc;
	}, {});

	const sortedTeams = Object.keys(byTeam).sort();

	const scrollToTeam = (teamId: string) => {
		setActiveTeam(teamId);
		sectionRefs.current[teamId]?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	if (isPending) {
		return <p>Loading...</p>
	}

	if (!session || !isAdmin) {
		navigate('/');
		return null;
	}

	return (
		<div className="py-5 flex flex-col text-center h-fit">
			<h1 className="text-2xl font-bold mb-6">Admin — All Submissions</h1>

			{sortedTeams.length === 0 && (
				<p className="text-gray-400">No submissions yet.</p>
			)}

			{sortedTeams.length > 0 && (
				<div className="flex flex-wrap gap-2 justify-center mb-10">
					{sortedTeams.map(teamId => (
						<button
							key={teamId}
							onClick={() => scrollToTeam(teamId)}
							className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
								activeTeam === teamId
									? "bg-blue-600 border-blue-600 text-white"
									: "bg-transparent border-gray-500 text-gray-300 hover:border-blue-500 hover:text-white"
							}`}
						>
							{teamId}
						</button>
					))}
				</div>
			)}

			{sortedTeams.map(teamId => {
				const teamSubmissions = [...byTeam[teamId]].sort(
					(a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
				);

				return (
					<div
						key={teamId}
						ref={el => { sectionRefs.current[teamId] = el; }}
						className="w-[40vw] mx-auto mb-10 text-left scroll-mt-6"
					>
						<h2 className="text-lg font-semibold text-white border-b border-gray-600 pb-2 mb-3">
							Team {teamId}
						</h2>
						{teamSubmissions.map(sub => (
							<div
								key={sub.id}
								className="bg-gray-700 border border-gray-600 rounded-lg px-5 py-4 mt-3 flex items-center justify-between"
							>
								<div>
									<p className="font-semibold text-white truncate">{sub.fileName}</p>
									<p className="text-gray-400 text-sm mt-1">
										{new Date(sub.uploadedAt).toLocaleString()}
									</p>
								</div>
								<a
									href={`${import.meta.env.VITE_BACKEND_URL}/api/submissions/file/${sub.fileName}`}
									download={sub.fileName}
									className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm shrink-0"
								>
									Download
								</a>
							</div>
						))}
					</div>
				);
			})}
		</div>
	);
}
