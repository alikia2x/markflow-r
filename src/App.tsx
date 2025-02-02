import { useState } from "react";
import OpenAI from "openai";
import { useAtom, useAtomValue } from "jotai";
import { configAtom } from "./configAtom";
import { autoScrollAtom } from "./scrollAtom";
import ConfigButton from "./components/ConfigButton.tsx";
import { ConfigModal } from "./components/ConfigModal.tsx";
import { ScrollToBottom } from "./components/ScrollToBottom.tsx";
import { MessageBox } from "./components/MessageBox.tsx";
import ChatMessages from "./components/ChatMessages.tsx";

function App() {
	const [messages, setMessages] = useState([]);
	const [inputText, setInputText] = useState("");
	const config = useAtomValue(configAtom);
	const [showConfig, setShowConfig] = useState(false);
	const [autoScroll, setAutoScroll] = useAtom(autoScrollAtom);

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
			<ConfigButton onClick={() => setShowConfig(!showConfig)} showConfig={showConfig} />
			<ConfigModal showConfig={showConfig} onClose={() => setShowConfig(false)} />

			{!autoScroll && <ScrollToBottom onClick={() => setAutoScroll(true)} />}

			<MessageBox
				value={inputText}
				onChange={(e) => setInputText(e.target.value)}
				onKeyPress={(e) => e.key === "Enter" && handleSend()}
				onClick={handleSend}
			/>

			<div className="h-dvh relative flex flex-col md:flex-row">
				<div className="md:w-1/6 lg:w-1/4 mx-auto"></div>

				{/* Chat Messages Component */}
				<ChatMessages messages={messages} />

				<div className="md:w-1/6 lg:w-1/4 mx-auto"></div>
			</div>
		</>
	);
}

export default App;