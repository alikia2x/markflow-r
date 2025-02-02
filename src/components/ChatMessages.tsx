import React from "react";
import ScrollableContainer from "../ScrollContainer.tsx";
import StreamMarkdown from "../StreamMarkdown.tsx";

interface ChatMessagesProps {
	messages: { role: string; content: string }[];
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
	return (
		<div className="flex-1 flex flex-col w-full md:w-3/4 lg:w-1/2 mx-auto">
			<ScrollableContainer
				contentIndicator={
					messages[messages.length - 1] ? messages[messages.length - 1].content ?? "" : ""
				}
			>
				<div className="h-6"></div>
				{messages.map((msg, index) => (
					<div key={index} className="my-4">
						<div
							className={`w-fit px-2 py-0.5 rounded-sm text-sm select-none text-gray-800 ${
								msg.role === "user" ? "bg-blue-100" : "bg-orange-100"
							}`}
						>
							{msg.role === "user" ? "USER" : "MODEL"}
						</div>
						<div className="max-w-full">
							<StreamMarkdown content={msg.content} />
						</div>
					</div>
				))}
				<div className="h-32"></div>
			</ScrollableContainer>
		</div>
	);
};

export default ChatMessages;