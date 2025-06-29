import { Calendar, Home, User, Settings, BookOpen, MessageSquare, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
  {
    title: "My Roadmaps",
    url: "/myroadmaps",
    icon: BookOpen,
  },
  {
    title: "Explore Roadmaps",
    url: "/exploreroadmaps",
    icon: BookOpen,
  },
  {
    title: "Forum",
    url: "/forum",
    icon: MessageSquare,
  },
  {
    title: "AI Teacher",
    url: "/ai-teacher",
    icon: User,
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = window.location.pathname;

  const handleNavigation = (url: string) => {
    if (url !== '#') {
      navigate(url);
    }
  };

  return (
    <aside className="card-base min-h-screen w-64 bg-white/80 shadow-md flex flex-col py-6 px-4 fixed top-0 left-0 z-30 border-r border-blue-100">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-yellow-200 flex items-center justify-center">
          <span className="text-white font-bold text-2xl">R</span>
        </div>
        <span className="font-bold text-xl text-blue-700 tracking-tight" style={{fontFamily: 'Inter, Rubik, sans-serif'}}>RoadMaster</span>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location === item.url;
            const isBlue = ["/myroadmaps", "/exploreroadmaps", "/forum", "/ai-teacher"].includes(item.url);
            return (
              <li key={item.title}>
                <button
                  onClick={() => handleNavigation(item.url)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all font-medium text-base
                    ${isActive ? (isBlue ? 'bg-blue-100 text-blue-700 shadow-sm' : 'bg-yellow-100 text-yellow-700 shadow-sm') : (isBlue ? 'text-blue-700 hover:bg-blue-50' : 'text-yellow-700 hover:bg-yellow-50')}
                    focus:outline-none focus:ring-2 focus:ring-blue-200`}
                  style={{fontFamily: 'Inter, Rubik, sans-serif'}}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto pt-8 text-xs text-gray-400 text-center">Study Mode</div>
    </aside>
  );
}
