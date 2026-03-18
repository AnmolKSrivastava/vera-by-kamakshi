import React from 'react';

export const BrowserRouter = ({ children }) => <div>{children}</div>;
export const Routes = ({ children }) => <div>{children}</div>;
export const Route = () => null;
export const Link = ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>;
export const useNavigate = () => jest.fn();
export const useLocation = () => ({ pathname: '/', search: '', hash: '', state: null });
export const useParams = () => ({});
export const useSearchParams = () => [new URLSearchParams(), jest.fn()];
export const Navigate = ({ to }) => null;
export const Outlet = () => null;
