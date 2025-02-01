import { useState } from "react";
import ScrollableContainer from "./ScrollContainer";
import StreamMarkdown from "./StreamMarkdown";
import OpenAI from "openai";
import { useAtom } from "jotai";
import { configAtom } from "./configAtom";

function App() {
	const [messages, setMessages] = useState([]);
	const [inputText, setInputText] = useState("");
	const [config, setConfig] = useAtom(configAtom);
	const [showConfig, setShowConfig] = useState(false);

	const client = new OpenAI({
		apiKey: config.apiKey,
		baseURL: config.baseURL,
		dangerouslyAllowBrowser: true,
	});

	const handleSend = async () => {
		if (!inputText.trim()) return;

		const userMessage = { role: "user", content: inputText };
		const newMessages = [...messages, userMessage];
		setMessages(newMessages);
		setInputText("");

		try {
			const stream = await client.chat.completions.create({
				model: config.model,
				messages: newMessages,
				temperature: config.temperature,
				stream: true,
			});

			const assistantMessage = { role: "assistant", content: "" };
			for await (const chunk of stream) {
				const content = chunk.choices[0]?.delta?.content || "";
				assistantMessage.content += content;
				setMessages([...newMessages, assistantMessage]);
			}
		} catch (error) {
			console.error("Error calling OpenAI API:", error);
		}
	};

	return (
		<>
			{/* Config Button for Mobile */}
			<button
				onClick={() => setShowConfig(!showConfig)}
				className="w-12 h-12 fixed top-4 left-4 z-50 p-2 bg-gray-200/70 backdrop-blur-lg rounded-full 
				flex justify-center items-center text-zinc-700"
			>
				{!showConfig && (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
					>
						<path
							fill="currentColor"
							d="M10.825 22q-.675 0-1.162-.45t-.588-1.1L8.85 18.8q-.325-.125-.612-.3t-.563-.375l-1.55.65q-.625.275-1.25.05t-.975-.8l-1.175-2.05q-.35-.575-.2-1.225t.675-1.075l1.325-1Q4.5 12.5 4.5 12.337v-.675q0-.162.025-.337l-1.325-1Q2.675 9.9 2.525 9.25t.2-1.225L3.9 5.975q.35-.575.975-.8t1.25.05l1.55.65q.275-.2.575-.375t.6-.3l.225-1.65q.1-.65.588-1.1T10.825 2h2.35q.675 0 1.163.45t.587 1.1l.225 1.65q.325.125.613.3t.562.375l1.55-.65q.625-.275 1.25-.05t.975.8l1.175 2.05q.35.575.2 1.225t-.675 1.075l-1.325 1q.025.175.025.338v.674q0 .163-.05.338l1.325 1q.525.425.675 1.075t-.2 1.225l-1.2 2.05q-.35.575-.975.8t-1.25-.05l-1.5-.65q-.275.2-.575.375t-.6.3l-.225 1.65q-.1.65-.587 1.1t-1.163.45zm1.225-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"
						/>
					</svg>
				)}
				{showConfig && (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="32"
						height="32"
						viewBox="0 0 24 24"
					>
						<path
							fill="none"
							stroke="currentColor"
							strokeLinecap="round"
							strokeWidth="2"
							d="m8 8l4 4m0 0l4 4m-4-4l4-4m-4 4l-4 4"
						/>
					</svg>
				)}
			</button>

			{/* Config Modal */}
			<div
				className={`fixed inset-0 bg-white/30 backdrop-blur-xl transition-[scale,opacity] duration-300 ease-in-out ${
					showConfig
						? "opacity-100 scale-100 z-40"
						: "opacity-0 scale-150 z-[-10]"
				} flex items-center justify-center h-screen`}
			>
				<div className="w-full h-full md:w-1/2 lg:w-1/3 md:h-auto mx-8 md:mx-0 mt-48 md:mt-0">
					<h2 className="font-bold text-2xl">Configuration</h2>
					<div>
						<label>Base URL:</label>
						<input
							type="text"
							value={config.baseURL}
							onChange={(e) =>
								setConfig({
									...config,
									baseURL: e.target.value,
								})
							}
							className="w-full p-2 border rounded"
						/>
					</div>
					<div>
						<label>API Key:</label>
						<input
							type="password"
							value={config.apiKey}
							onChange={(e) =>
								setConfig({ ...config, apiKey: e.target.value })
							}
							className="w-full p-2 border rounded"
						/>
					</div>
					<div>
						<label>Model:</label>
						<input
							value={config.model}
							onChange={(e) =>
								setConfig({ ...config, model: e.target.value })
							}
							className="w-full p-2 border rounded"
						/>
					</div>
					<div>
						<label>Temperature:</label>
						<input
							type="number"
							step="0.05"
							value={config.temperature}
							onChange={(e) =>
								setConfig({
									...config,
									temperature: parseFloat(e.target.value),
								})
							}
							className="w-full p-2 border rounded"
						/>
					</div>
				</div>
			</div>
			<div
				className="bottom-0 left-0 w-full fixed pb-4 flex justify-center
					 items-center gap-2 bg-white/40 backdrop-blur-lg z-20"
			>
				<div className="md:w-1/6 lg:w-1/4 mx-auto"></div>
				<input
					type="text"
					value={inputText}
					onChange={(e) => setInputText(e.target.value)}
					onKeyPress={(e) => e.key === "Enter" && handleSend()}
					className="w-full py-2 px-4 bg-neutral-100 rounded-2xl border-2 border-neutral-200/40"
					placeholder="Type a message..."
				/>
				<div className="flex gap-x-1.5">
					<div>
						<button
							aria-label="发送提示"
							data-testid="send-button"
							className="flex h-9 w-9 items-center justify-center rounded-full 
									transition-colors hover:opacity-70 duration-200
									dark:disabled:text-token-main-surface-secondary bg-black text-white
									 disabled:bg-[#D7D7D7]"
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
			</div>
			<div className="h-dvh relative flex flex-col md:flex-row">
				<div className="md:w-1/6 lg:w-1/4 mx-auto"></div>

				{/* Chat Interface */}
				<div className="flex-1 flex flex-col w-full md:w-3/4 lg:w-1/2 mx-auto">
					<ScrollableContainer contentIndicator={messages.length}>
						<div className="h-6"></div>
						{messages.map((msg, index) => (
							<div className="my-4">
								<div
									className={`w-fit px-2 py-0.5 rounded-sm text-sm text-gray-800 ${
										msg.role == "user"
											? "bg-blue-100"
											: "bg-orange-100"
									}`}
								>
									{msg.role == "user" ? "USER" : "MODEL"}
								</div>
								<div key={index} className={`max-w-full`}>
									<StreamMarkdown content={msg.content} />
								</div>
							</div>
						))}
						<div className="h-20"></div>
					</ScrollableContainer>
				</div>
				<div className="md:w-1/6 lg:w-1/4 mx-auto"></div>
			</div>
		</>
	);
}

export default App;
