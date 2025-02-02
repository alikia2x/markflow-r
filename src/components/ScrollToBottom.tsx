export function ScrollToBottom(props: { onClick: () => void }) {
	return <div className="fixed bottom-20 left-0 right-0 flex justify-center z-30 pointer-events-none">
		<button
			className="bg-zinc-100/50 border border-gray-200/69 p-1.5 rounded-full pointer-events-auto backdrop-blur-lg"
			onClick={props.onClick}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				className="w-5 h-5"
			>
				<path
					fillRule="evenodd"
					d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
					clipRule="evenodd"
				></path>
			</svg>
		</button>
	</div>;
}