export function MessageBox(props: {
	value: string,
	onChange: (e) => void,
	onKeyPress: (e) => Promise<void>,
	onClick: () => Promise<void>
}) {
	return <div
		className="bottom-0 left-0 w-full fixed pb-4 flex justify-center
					 items-center gap-2 bg-white/40 backdrop-blur-lg z-20"
	>
		<div className="md:w-1/6 lg:w-1/4 mx-auto"></div>
		<input
			type="text"
			value={props.value}
			onChange={props.onChange}
			onKeyPress={props.onKeyPress}
			className="w-full py-2 px-4 bg-neutral-100 rounded-2xl border-2 border-neutral-200/40"
			placeholder="Type a message..."
		/>
		<div className="flex gap-x-1.5">
			<div>
				<button
					aria-label="发送提示"
					data-testid="send-button"
					className="flex h-9 w-9 items-center justify-center rounded-full
									transition-colors hover:opacity-70 duration-200 bg-black text-white"
					onClick={props.onClick}
				>
					<svg
						width="32"
						height="32"
						viewBox="0 0 32 32"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						className="icon-2xl"
					>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M15.1918 8.90615C15.6381 8.45983 16.3618 8.45983 16.8081 8.90615L21.9509 14.049C22.3972 14.4953 22.3972 15.2189 21.9509 15.6652C21.5046 16.1116 20.781 16.1116 20.3347 15.6652L17.1428 12.4734V22.2857C17.1428 22.9169 16.6311 23.4286 15.9999 23.4286C15.3688 23.4286 14.8571 22.9169 14.8571 22.2857V12.4734L11.6652 15.6652C11.2189 16.1116 10.4953 16.1116 10.049 15.6652C9.60265 15.2189 9.60265 14.4953 10.049 14.049L15.1918 8.90615Z"
							fill="currentColor"
						></path>
					</svg>
				</button>
			</div>
		</div>
		<div className="md:w-1/6 lg:w-1/4 mx-auto"></div>
	</div>;
}