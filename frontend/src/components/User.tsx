interface UserProps {
    id: string;
    avatar: string | null | undefined;
}

export default function User({ id, avatar }: UserProps) {
    if (!avatar) {
        avatar = "https://cdn.discordapp.com/embed/avatars/0.png";
    }
    return (
        <div className="flex flex-row items-center gap-4 justify-center">
            <img src={avatar} alt="avatar" className="w-8 h-8 rounded-full" />
            <p className="text-center text-xl">{id}</p>
        </div>
    );
}