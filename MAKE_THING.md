Plan: File Drop Submission System with Team ID Tracking
Users sign in via Discord → backend resolves their team ID via PocketBase → they upload a file on the Dashboard → the file is saved to a Docker-volume-backed folder on the backend → an upload record (team ID, filename, timestamp) is tracked in PGlite.
Steps
Add a new Drizzle schema table submission in auth-schema.ts with columns id, teamId, fileName, uploadedAt, then generate and run a new migration with drizzle-kit generate and migrate.
Add a Docker volume for submissions in docker-compose.yml — a new named volume (e.g. submissions_data) mounted to /app/submissions in the backend container.
Add two backend endpoints in server.ts:
POST /api/submissions/:teamId — accepts a multipart/form-data file upload (using multer pointed at /app/submissions/<teamId>/), saves the file to disk, and inserts a record into the submission table.
GET /api/submissions/:teamId — queries PGlite for all submission records for that team and returns them.
Build a FileUpload component in frontend/src/components/FileUpload.tsx using the already-installed react-dropzone — on drop it posts the file as FormData to POST /api/submissions/:teamId.
Build out the Dashboard.tsx page — use authClient.useSession() to get the signed-in user, call GET /api/team-id/:uid to resolve the team ID, fetch existing submissions via GET /api/submissions/:teamId, then render the FileUpload component and a submission history list.
Wire up routing in App.tsx — add react-router routes for / → Home and /dashboard → Dashboard (the callbackURL on sign-in already points to /dashboard).
Further Considerations
Auth guard on upload endpoint — should POST /api/submissions/:teamId require a valid better-auth session cookie, or is the team ID alone sufficient to gate access? Recommend verifying the session and confirming the calling user belongs to that team.
File type/size restrictions — should only .zip files be accepted, or any file type? A max file size limit should be set on multer to prevent abuse.
One submission per team or multiple? — should re-uploading overwrite the previous file, or should all uploads be kept with the history shown on the dashboard?0