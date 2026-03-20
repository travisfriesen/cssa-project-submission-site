import { authClient } from '../../lib/auth-client'
import {useNavigate} from "react-router";
import {useEffect, useState} from "react";
import Dropzone from "react-dropzone";

export default function Dashboard() {
    const { data: session, isPending } = authClient.useSession();
    const navigate = useNavigate();
    const [teamId, setTeamId] = useState<string>("Unknown");
    const [entries, setEntries] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);

    // @ts-expect-error trust me its there
    const uID: string | undefined = session?.user?.discordId;

    useEffect(() => {
        if (!uID) return;
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
        if (!teamId || teamId === "Unknown") return;
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

    const handleFileUpload = async (acceptedFiles: File) => {
        setUploadStatus("Uploading...");
        setError(null);
        
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/submissions/${teamId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/zip'
                },
                credentials: 'include',
                body: acceptedFiles,
            });

            if (response.status === 401) {
                setError("Session expired. Please sign in again.");
                setUploadStatus(null);
                navigate('/');
                return;
            }

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            setUploadStatus("Upload successful!");
            setTimeout(() => setUploadStatus(null), 3000);
            
            // Refresh submissions list
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/submissions/${teamId}`, {
                credentials: 'include'
            })
                .then(res => res.json())
                .then(data => setEntries(data.entries ?? []))
                .catch(console.error);
        } catch (err) {
            console.error(err);
            setError("Failed to upload file. Please try again.");
            setUploadStatus(null);
        }
    }

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

            {uploadStatus && (
                <div className="bg-green-500 text-white px-4 py-2 rounded-lg mx-auto mt-4 max-w-md">
                    {uploadStatus}
                </div>
            )}

            <Dropzone accept={{
                'application/tar+gzip': ['.tar.gz'],
                'application/zip': ['.zip'],
                'application/x-zip-compressed': ['.zip'],
                ' multipart/x-zip': ['.zip']
            }} maxFiles={1} maxSize={2e+9} onDrop={acceptedFiles => handleFileUpload(acceptedFiles[0])}>
                {({getRootProps, getInputProps}) => (
                    <section>
                        <div {...getRootProps()} className={`bg-gray-600 w-[40vw] h-[20vw] flex flex-col items-center justify-center mx-auto mt-10 border-4 border-dashed border-gray-400 rounded-lg cursor-pointer`}>
                            <input {...getInputProps()} />
                            <p>Drag 'n' drop some files here, or click to select files</p>
                        </div>
                    </section>
                )}
            </Dropzone>
            <div>
                <h2 className={`mt-10`}>Your submissions:</h2>
                <ul>
                    {entries.map((entry, index) => (
                        <li key={index}>{entry}</li>
                    ))}
                </ul>
            </div>
        </div>
    )
}