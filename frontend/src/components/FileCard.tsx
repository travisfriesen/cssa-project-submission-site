export interface IFileCardProps {
	id: string;
	teamId: string;
	fileName: string;
	uploadedAt: Date;
}

export default function FileCard(props: IFileCardProps) {
	return (
		<div className="bg-gray-700 border border-gray-600 rounded-lg px-5 py-4 w-[40vw] mx-auto mt-3 text-left">
			<p className="font-semibold text-white truncate">{props.fileName}</p>
			<p className="text-gray-400 text-sm mt-1">
				{new Date(props.uploadedAt).toLocaleString()}
			</p>
		</div>
	)
}
