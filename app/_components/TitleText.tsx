type TitleTextProps = {
    title: string;
    options?: {
        className?: string;
        styles?: Record<string, string>;
    }
}

const TitleText = ({ title, options }: TitleTextProps) => {
    return (
        <h1
            className={`text-xl xl:text-3xl text-amber-300 uppercase select-none text-center leading-relaxed ${options?.className}`}
            style={{ ...options?.styles }}
        >
            {title}
        </h1>
    )
}

export default TitleText;