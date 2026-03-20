import { createRoot } from 'react-dom/client'
import './index.css'
import {createBrowserRouter, RouterProvider} from 'react-router'
import Home from "./pages/Home/Home.tsx"
import Dashboard from "./pages/Dashboard/Dashboard.tsx";
import Admin from "./pages/Dashboard/Admin/Admin.tsx";
import Header from "./components/Header.tsx";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Home />
	},
	{
		path: "/dashboard",
		element: <Dashboard />
	},
	{
		path: "/admin",
		element: <Admin />
	}
]);

createRoot(document.getElementById('root')!).render(
	<div className="w-screen h-screen overflow-hidden flex flex-col">
		<Header />
		<div className="flex-1 overflow-auto">
			<RouterProvider router={router} />
		</div>
	</div>
)