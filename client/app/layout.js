'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import './globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();
const RootLayout = ({ children }) => {
    return (_jsx("html", { lang: "en", children: _jsx("body", { children: _jsx(QueryClientProvider, { client: queryClient, children: children }) }) }));
};
export default RootLayout;
