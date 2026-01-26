import { useState, type ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { NavLink, Link } from 'react-router-dom';
import { LogOut, Menu, X, Folder, User as UserIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

const SidebarItem = ({ to, icon: Icon, label, onClick }: { to: string; icon: any; label: string; onClick?: () => void }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
            cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1",
                isActive
                    ? "bg-primary/10 text-primary font-medium shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )
        }
    >
        <Icon size={20} />
        <span>{label}</span>
    </NavLink>
);

const Layout = ({ children }: { children: ReactNode }) => {
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (!user) return null;

    const menuItems = (
        <>
            <SidebarItem to="/admin/drive" icon={Folder} label="System Drive" onClick={() => setMobileMenuOpen(false)} />
            <SidebarItem to="/admin/profile" icon={UserIcon} label="My Profile" onClick={() => setMobileMenuOpen(false)} />
        </>
    );

    return (
        <div className="flex min-h-screen bg-muted/20 font-sans">
            {/* Mobile Header */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-xl border-b z-50 flex md:hidden items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20">
                        GD
                    </div>
                    <div>
                        <h1 className="font-bold text-base leading-tight tracking-tight">GovDigital</h1>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Portal</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-72 bg-card/95 backdrop-blur-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="pt-20 px-4 flex flex-col h-full">
                    <div className="flex-1">
                        <p className="px-4 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Menu</p>
                        <nav className="space-y-1">
                            {menuItems}
                        </nav>
                    </div>

                    <div className="p-4 border-t">
                        <Link to="/admin/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                            <div className="h-9 w-9 bg-primary/20 rounded-full flex items-center justify-center text-primary text-sm font-semibold">
                                {user.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate capitalize">{user.role}</p>
                            </div>
                        </Link>
                        <button
                            onClick={() => { setMobileMenuOpen(false); logout(); }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Desktop Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-64 border-r bg-card/80 backdrop-blur-xl z-40 hidden md:flex flex-col shadow-[1px_0_20px_0_rgba(0,0,0,0.05)]">
                <div className="p-6 flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
                        GD
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight tracking-tight">GovDigital</h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Portal</p>
                    </div>
                </div>

                <div className="flex-1 px-4 py-4 overflow-y-auto">
                    <div className="mb-2">
                        <p className="px-4 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Menu</p>
                        <nav className="space-y-1">
                            {menuItems}
                        </nav>
                    </div>
                </div>

                <div className="p-4 border-t bg-card/50">
                    <Link to="/admin/profile" className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                        <div className="h-9 w-9 bg-primary/20 rounded-full flex items-center justify-center text-primary text-sm font-semibold">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate capitalize">{user.role}</p>
                        </div>
                    </Link>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 relative min-h-screen pt-16 md:pt-0">
                <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
