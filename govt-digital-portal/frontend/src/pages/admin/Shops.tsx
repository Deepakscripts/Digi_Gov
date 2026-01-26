import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Plus, Trash2, Search, Store, Edit, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const Shops = () => {
    const [shops, setShops] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingShopId, setEditingShopId] = useState<string | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewingShop, setViewingShop] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        shopName: '',
        ownerName: '',
        licenseNumber: '',
        address: '',
        contactNumber: '',
        email: '',
        password: ''
    });

    const fetchShops = async () => {
        try {
            const { data } = await api.get('/shops');
            setShops(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchShops();
    }, []);

    const resetForm = () => {
        setFormData({ shopName: '', ownerName: '', licenseNumber: '', address: '', contactNumber: '', email: '', password: '' });
        setIsEditMode(false);
        setEditingShopId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditMode && editingShopId) {
                // Update existing shop
                await api.put(`/shops/${editingShopId}`, formData);
                toast.success('Shop updated successfully');
            } else {
                // Create new shop
                await api.post('/shops', formData);
                toast.success('Shop added successfully');
            }
            setIsModalOpen(false);
            resetForm();
            fetchShops();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save shop');
        }
    };

    const handleEdit = (shop: any) => {
        setFormData({
            shopName: shop.shopName,
            ownerName: shop.ownerName,
            licenseNumber: shop.licenseNumber,
            address: shop.address,
            contactNumber: shop.contactNumber,
            email: shop.userId?.email || '',
            password: '' // Don't prefill password
        });
        setEditingShopId(shop._id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleView = (shop: any) => {
        setViewingShop(shop);
        setIsViewOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will delete the shop and its user account.')) return;
        try {
            await api.delete(`/shops/${id}`);
            toast.success('Shop deleted');
            fetchShops();
        } catch (error) {
            toast.error('Failed to delete shop');
        }
    };

    const filteredShops = shops.filter(shop =>
        shop.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header - Responsive */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Manage Shops</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">Add and manage registered shops across the district.</p>
                </div>
                <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="gap-2 w-full sm:w-auto">
                    <Plus size={18} /> Add New Shop
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search shops by name or license..."
                    className="pl-9 w-full md:max-w-md bg-card"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Shop Cards Grid - Responsive */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredShops.map((shop) => (
                    <div key={shop._id} className="bg-card border rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Store size={20} />
                            </div>
                            {/* Action Buttons */}
                            <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10" onClick={() => handleView(shop)}>
                                    <Eye size={14} />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleEdit(shop)}>
                                    <Edit size={14} />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(shop._id)}>
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        </div>
                        <h3 className="font-semibold text-lg">{shop.shopName}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{shop.licenseNumber}</p>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between py-1 border-b border-dashed">
                                <span className="text-muted-foreground">Owner</span>
                                <span className="font-medium truncate ml-2 max-w-[120px] sm:max-w-[150px]">{shop.ownerName}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-dashed">
                                <span className="text-muted-foreground">Contact</span>
                                <span className="font-medium">{shop.contactNumber}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-dashed">
                                <span className="text-muted-foreground">Address</span>
                                <span className="font-medium truncate ml-2 max-w-[120px] sm:max-w-[150px]" title={shop.address}>{shop.address}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-1">
                            <span>Added {new Date(shop.createdAt).toLocaleDateString()}</span>
                            <span className="truncate">{shop.userId?.email}</span>
                        </div>
                    </div>
                ))}
                {filteredShops.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        No shops found. Add one to get started.
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }} title={isEditMode ? "Edit Shop Details" : "Register New Shop"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Shop Name</label>
                            <Input value={formData.shopName} onChange={e => setFormData({ ...formData, shopName: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Owner Name</label>
                            <Input value={formData.ownerName} onChange={e => setFormData({ ...formData, ownerName: e.target.value })} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">License Number</label>
                        <Input value={formData.licenseNumber} onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })} required disabled={isEditMode} />
                        {isEditMode && <p className="text-xs text-muted-foreground">License number cannot be changed</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Address</label>
                        <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Contact Number</label>
                        <Input value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} required />
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium mb-3">Shop Account Credentials</h4>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email (Login ID)</label>
                                <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required disabled={isEditMode} />
                                {isEditMode && <p className="text-xs text-muted-foreground">Email cannot be changed</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{isEditMode ? 'New Password (leave blank to keep unchanged)' : 'Password'}</label>
                                <Input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required={!isEditMode} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }}>Cancel</Button>
                        <Button type="submit">{isEditMode ? 'Update Shop' : 'Create Shop'}</Button>
                    </div>
                </form>
            </Modal>

            {/* View Details Modal */}
            <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Shop Details">
                {viewingShop && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 pb-4 border-b">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Store size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{viewingShop.shopName}</h3>
                                <p className="text-muted-foreground">{viewingShop.licenseNumber}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs uppercase text-muted-foreground font-semibold">Owner Name</p>
                                <p className="font-medium">{viewingShop.ownerName}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase text-muted-foreground font-semibold">Contact Number</p>
                                <p className="font-medium">{viewingShop.contactNumber}</p>
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                                <p className="text-xs uppercase text-muted-foreground font-semibold">Address</p>
                                <p className="font-medium">{viewingShop.address}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase text-muted-foreground font-semibold">Login Email</p>
                                <p className="font-medium">{viewingShop.userId?.email}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase text-muted-foreground font-semibold">Created On</p>
                                <p className="font-medium">{new Date(viewingShop.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
                            <Button onClick={() => { setIsViewOpen(false); handleEdit(viewingShop); }}>
                                <Edit size={14} className="mr-2" /> Edit Shop
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Shops;
