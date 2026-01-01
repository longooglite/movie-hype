"use client";

import "./globals.css";
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const RootLayout = ({ children }: { children: ReactNode }) => {
	return (
		<html lang="en">
			<body>
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			</body>
		</html>
	);
};

export default RootLayout;


