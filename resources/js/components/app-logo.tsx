export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center">
                <img
                    src="/images/logo.png"
                    alt="TDFC"
                    className="h-8 w-8 object-contain"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">TDFC Companion App</span>
            </div>
        </>
    );
}
