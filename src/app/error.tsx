"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// eslint-disable-next-line no-console
		console.error("Caught Error:", error);
	}, [error]);

	return (
		<div className="relative flex flex-col items-center justify-center min-h-screen px-6">
			{/* Background Image */}
			<div
				className="absolute inset-0 z-0 bg-contain obj bg-center opacity-5"
				style={{ backgroundImage: "url('/full_background.png')" }}
			/>
			<div className="absolute inset-0 -z-10 bg-primary opacity-95" />


			<div className="bg-white rounded-xl shadow-md p-10 max-w-md w-full text-center animate-fade-in relative z-10">
				<div className="mx-auto mb-6 w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
					<AlertTriangle className="w-10 h-10 text-primary" />
				</div>

				<h2 className="text-2xl font-bold text-primary mb-3">
					حدث خطأ غير متوقع
				</h2>

				<p className="text-gray-600 leading-relaxed mb-6">
					نأسف لحدوث هذا الخلل. يعمل فريقنا التقني حالياً على معالجة المشكلة في
					أسرع وقت.
					<br />
					يُرجى المحاولة مرة أخرى بعد لحظات.
				</p>

				<button
					onClick={() => reset()}
					className="px-6 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary/90 transition-colors duration-200"
				>
					إعادة المحاولة
				</button>
			</div>

			<p className="mt-6 text-sm text-gray-500 relative z-10">
				في حال استمرار المشكلة، يمكنك التواصل مع فريق الدعم.
			</p>
		</div>
	);
}
