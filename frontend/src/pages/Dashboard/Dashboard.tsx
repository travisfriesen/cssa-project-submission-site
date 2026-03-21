import { authClient } from '../../lib/auth-client'
import { useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import Dropzone from "react-dropzone";
import FileCard, { type IFileCardProps } from '../../components/FileCard';
import ErrorMessage from '../../components/ErrorMessage';

export default function Dashboard() {
	const { data: session, isPending } = authClient.useSession();
	const navigate = useNavigate();
	const [teamId, setTeamId] = useState<string | null>(null);
	const [entries, setEntries] = useState<IFileCardProps[]>([]);
	const [pendingFile, setPendingFile] = useState<File | null>(null);
	const [uploadProgress, setUploadProgress] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);
	const xhrRef = useRef<XMLHttpRequest | null>(null);

	// @ts-expect-error trust me its there
	const uID: string | undefined = session?.user?.discordId;

	useEffect(() => {
		if (!uID) return;
		console.log("getting team id")
		fetch(`${import.meta.env.VITE_BACKEND_URL}/api/team-id/${uID}`, {
            credentials: 'include'
        })
        .then(async res => {
                if (res.status === 401) {
                    setError("Session expired. Please sign in again.");
                    navigate('/');
                    return null;
                }
                if (!res.ok) {
                    throw new Error('Failed to fetch team ID');
                }
                return res.json();
            })
			.then(data => {
                if (data) {
                    setTeamId(data.teamId ?? "Unknown");
                }
            })
            .catch((err) => {
                console.error(err);
                setTeamId("Unknown");
                setError("Failed to fetch team information");
            });
	}, [uID, navigate]);

  useEffect(() => {
        if (!teamId) return;
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/submissions/${teamId}`, {
            credentials: 'include'
        })
            .then(async res => {
                if (res.status === 401) {
                    setError("Session expired. Please sign in again.");
                    navigate('/');
                    return null;
                }
                if (!res.ok) {
                    throw new Error('Failed to fetch submissions');
                }
                return res.json();
            })
            .then(data => {
                if (data) {
                    setEntries(data.entries ?? []);
                }
            })
            .catch((err) => {
                console.error(err);
                setEntries([]);
            });
    }, [teamId, navigate]);

	if (isPending) {
		return <p>Loading...</p>
	}

	if (!session) {
		navigate('/');
		return null;
	}

	if (teamId === null) {
		return <p>Loading team...</p>;
	}

	if (teamId === "Unknown" && !isPending) {
		return <><ErrorMessage message='Team is unknown, please check to see if you are in a team in the discord. Otherwise contact the CSSA for help.'/></>
	}

	const handleSubmit = () => {
		if (!pendingFile) return;

		const xhr = new XMLHttpRequest();
		xhrRef.current = xhr;

		xhr.upload.onprogress = (e) => {
			if (e.lengthComputable) {
				setUploadProgress(Math.round((e.loaded / e.total) * 100));
			}
		};

		xhr.onload = () => {
			setUploadProgress(null);
			setPendingFile(null);
			xhrRef.current = null;
			fetch(`${import.meta.env.VITE_BACKEND_URL}/api/submissions/${teamId}`, {
				credentials: 'include'
			})
				.then(res => res.json())
				.then(data => setEntries(data.entries ?? []))
				.catch(() => { });
		};

		xhr.onerror = () => {
			setUploadProgress(null);
			xhrRef.current = null;
		};

		xhr.open('POST', `${import.meta.env.VITE_BACKEND_URL}/api/submissions/${teamId}`);
		xhr.withCredentials = true;
		xhr.setRequestHeader('Content-Type', 'application/zip');
		xhr.send(pendingFile);
	};

	// if (teamId === "Unknown") {
	//     return (
	//         <div className={`py-5 flex flex-col text-center h-screen`}>
	//             <h1>Welcome!</h1>
	//             <p>You are not part of any team yet.</p>
	//             <p>Please create one within the discord.</p>
	//         </div>
	//     )
	// }

	return (
		<div className={`py-5 flex flex-col text-center h-fit`}>
			<h1>Welcome team {teamId}!</h1>

			{error && (
                <div className="bg-red-500 text-white px-4 py-2 rounded-lg mx-auto mt-4 max-w-md">
                    {error}
                </div>
            )}

			<Dropzone accept={{
				'application/tar+gzip': ['.tar.gz'],
				'application/zip': ['.zip'],
				'application/x-zip-compressed': ['.zip'],
				' multipart/x-zip': ['.zip']
			}} maxFiles={1} maxSize={2e+9} onDrop={acceptedFiles => setPendingFile(acceptedFiles[0])}>
				{({ getRootProps, getInputProps }) => (
					<section>
						<div {...getRootProps()} className={`bg-gray-600 w-[40vw] h-[20vw] flex flex-col items-center justify-center mx-auto mt-10 border-4 border-dashed border-gray-400 rounded-lg cursor-pointer`}>
							<input {...getInputProps()} />
							{pendingFile
								? <p>{pendingFile.name}</p>
								: <p>Drag 'n' drop some files here, or click to select files</p>
							}
						</div>
					</section>
				)}
			</Dropzone>

			{pendingFile && uploadProgress === null && (
				<button
					onClick={handleSubmit}
					className="mx-auto mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
				>
					Submit
				</button>
			)}

			{uploadProgress !== null && (
				<div className="w-[40vw] mx-auto mt-4">
					<p className="text-sm mb-2 text-gray-300">Uploading {pendingFile?.name}...</p>
					<div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
						<div className="h-3 bg-blue-500 rounded-full w-1/4" style={{ animation: 'slide 1.8s ease-in-out infinite' }} />
					</div>
				</div>
			)}

			<div>
				<h2 className={`my-10 text-xl`}>Your submissions:</h2>
				{[...entries]
					.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
					.map((entry) => (
						<FileCard key={entry.id} {...entry} />
					))}
			</div>
		</div>
	)
}