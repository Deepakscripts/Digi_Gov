import { Link } from 'react-router-dom';
import { Store, Mail, File, ArrowRight, Shield } from 'lucide-react';

const Dashboard = () => {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                    <Shield size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Admin Portal</h1>
                    <p className="text-muted-foreground text-lg mt-1">Manage district shops, official notices, and records.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Link to="/admin/shops" className="block group">
                    <div className="bg-card border rounded-xl p-6 h-full flex flex-col justify-between shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                        <div>
                            <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                                <Store size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-600 transition-colors">Manage Shops</h3>
                            <p className="text-muted-foreground text-sm">Register new shops, view details, and manage accounts.</p>
                        </div>
                        <div className="mt-4 pt-4 border-t flex items-center text-sm font-medium text-purple-600">
                            Go to Shops <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>

                <Link to="/admin/notices" className="block group">
                    <div className="bg-card border rounded-xl p-6 h-full flex flex-col justify-between shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                        <div>
                            <div className="h-12 w-12 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-600 mb-4">
                                <Mail size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 group-hover:text-orange-600 transition-colors">Notices</h3>
                            <p className="text-muted-foreground text-sm">Compose, send, and track status of digital notices.</p>
                        </div>
                        <div className="mt-4 pt-4 border-t flex items-center text-sm font-medium text-orange-600">
                            Go to Notices <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>

                <Link to="/admin/drive" className="block group">
                    <div className="bg-card border rounded-xl p-6 h-full flex flex-col justify-between shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                        <div>
                            <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                                <File size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">File Drive</h3>
                            <p className="text-muted-foreground text-sm">Centralized document storage and management system.</p>
                        </div>
                        <div className="mt-4 pt-4 border-t flex items-center text-sm font-medium text-blue-600">
                            Open Drive <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;
