export default function ErrorMessage({ message }: { message: string }) {
	return (
		<div className="bg-red-500 text-white px-4 py-2 rounded-lg mx-auto mt-4 max-w-md">
			{message}
		</div>
	);
}
