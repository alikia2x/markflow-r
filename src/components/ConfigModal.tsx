import { useAtom } from "jotai";
import { configAtom } from "../configAtom";

interface ConfigModalProps {
	showConfig: boolean;
	onClose: () => void;
}

export const ConfigModal = ({ showConfig, onClose }) => {
	const [config, setConfig] = useAtom(configAtom);

	return (
		<div
			className={`fixed inset-0 bg-white/30 backdrop-blur-xl duration-300 ease-in-out ${
				showConfig ? "opacity-100 scale-100 z-40" : "opacity-0 scale-150 z-[-10]"
			} flex items-center justify-center h-screen`}
			onClick={onClose}
		>
			<div
				className="w-full h-full md:w-1/2 lg:w-1/3 md:h-auto mx-8 md:mx-0 mt-48 md:mt-0 relative"
				onClick={(e) => e.stopPropagation()}
			>
				<h2 className="font-bold text-2xl mb-4">Configuration</h2>
				<div>
					<label htmlFor="baseURL" className="block mb-1">
						Base URL:
					</label>
					<input
						id="baseURL"
						type="text"
						value={config.baseURL}
						spellCheck="false"
						onChange={(e) =>
							setConfig({ ...config, baseURL: e.target.value })
						}
						className="w-full p-2 border rounded mb-4"
					/>
				</div>
				<div>
					<label htmlFor="apiKey" className="block mb-1">
						API Key:
					</label>
					<input
						id="apiKey"
						type="password"
						value={config.apiKey}
						onChange={(e) =>
							setConfig({ ...config, apiKey: e.target.value })
						}
						className="w-full p-2 border rounded mb-4"
					/>
				</div>
				<div>
					<label htmlFor="model" className="block mb-1">
						Model:
					</label>
					<input
						id="model"
						value={config.model}
						spellCheck="false"
						onChange={(e) =>
							setConfig({ ...config, model: e.target.value })
						}
						className="w-full p-2 border rounded mb-4"
					/>
				</div>
				<div>
					<label htmlFor="temperature" className="block mb-1">
						Temperature:
					</label>
					<input
						id="temperature"
						type="number"
						step="0.05"
						value={config.temperature}
						onChange={(e) =>
							setConfig({
								...config,
								temperature: parseFloat(e.target.value),
							})
						}
						className="w-full p-2 border rounded mb-4"
					/>
				</div>
			</div>
		</div>
	);
};
