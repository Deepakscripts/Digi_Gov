import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Plus, Send, FileText, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import DrivePicker from '../../components/drive/DrivePicker';

const Notices = () => {
    const [notices, setNotices] = useState<any[]>([]);
    const [shops, setShops] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Reply Modal States
    const [isRepliesModalOpen, setIsRepliesModalOpen] = useState(false);
    const [replies, setReplies] = useState<any[]>([]);
    const [loadingReplies, setLoadingReplies] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        noticeNumber: '',
        shopIds: [] as string[],
        tags: [] as string[],
    });
    const [file, setFile] = useState<File | null>(null);
    const [tagName, setTagName] = useState('');

    // Drive Picker State
    const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
    const [driveFile, setDriveFile] = useState<any | null>(null);

    useEffect(() => {
        fetchNotices();
        fetchShops();
    }, []);

    const fetchNotices = async () => {
        try {
            const { data } = await api.get('/notices');
            setNotices(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchShops = async () => {
        try {
            const { data } = await api.get('/shops');
            setShops(data);
        } catch (error) {
            console.error(error);
        }
    }

    const handleViewReplies = async (noticeId: string) => {
        setIsRepliesModalOpen(true);
        setLoadingReplies(true);
        try {
            const { data } = await api.get(`/notices/${noticeId}/replies`);
            setReplies(data);
        } catch (error) {
            toast.error("Failed to fetch replies");
        } finally {
            setLoadingReplies(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('noticeNumber', formData.noticeNumber);
        data.append('shopIds', JSON.stringify(formData.shopIds));
        data.append('tags', JSON.stringify(formData.tags));
        if (file) data.append('document', file);
        if (driveFile) data.append('driveFileUrl', driveFile.url);

        try {
            await api.post('/notices', data);
            toast.success('Notice sent successfully');
            setIsModalOpen(false);
            setFormData({ title: '', description: '', noticeNumber: '', shopIds: [], tags: [] });
            setTagName('');
            setFile(null);
            setDriveFile(null);
            fetchNotices();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send notice');
        }
    };

    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagName.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagName.trim())) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, tagName.trim()] }));
            }
            setTagName('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
    };

    const predefinedTags = ['Important', 'Urgent', 'Information', 'Requirement', 'Audit'];

    const toggleShopSelection = (id: string) => {
        setFormData(prev => {
            if (prev.shopIds.includes(id)) {
                return { ...prev, shopIds: prev.shopIds.filter(sid => sid !== id) };
            } else {
                return { ...prev, shopIds: [...prev.shopIds, id] };
            }
        });
    };

    const selectAll = () => {
        if (formData.shopIds.length === shops.length) {
            setFormData(prev => ({ ...prev, shopIds: [] }));
        } else {
            setFormData(prev => ({ ...prev, shopIds: shops.map(s => s._id) }));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notices</h1>
                    <p className="text-muted-foreground mt-1">Send and track digital notices to shops.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                    <Plus size={18} /> Compose Notice
                </Button>
            </div>

            <div className="space-y-4">
                {notices.map((notice) => (
                    <div key={notice._id} className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full font-mono">{notice.noticeNumber}</span>
                                    {notice.tags && notice.tags.map((tag: string) => (
                                        <span key={tag} className="bg-secondary text-secondary-foreground text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium border border-border">
                                            {tag}
                                        </span>
                                    ))}
                                    <span className="text-xs text-muted-foreground ml-2">{new Date(notice.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h3 className="font-semibold text-lg">{notice.title}</h3>
                                <p className="text-muted-foreground text-sm line-clamp-2 mt-1">{notice.description}</p>
                            </div>
                            {notice.attachmentUrl && (
                                <a href={`http://localhost:5000${notice.attachmentUrl}`} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm bg-secondary/50 p-2 rounded-md hover:bg-secondary transition-colors ml-4 shrink-0">
                                    <FileText size={14} /> View Document
                                </a>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold">Sent To</p>
                                <p className="text-xl font-bold">{notice.sentTo.length}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold">Viewed</p>
                                <p className="text-xl font-bold text-blue-500">{notice.sentTo.filter((s: any) => s.status !== 'sent').length}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold">Replied</p>
                                <p className="text-xl font-bold text-green-500">{notice.sentTo.filter((s: any) => s.replyId).length}</p>
                            </div>
                            <div>
                                <Button variant="outline" size="sm" className="w-full mt-1" onClick={() => handleViewReplies(notice._id)}>View Replies</Button>
                            </div>
                        </div>
                    </div>
                ))}
                {notices.length === 0 && <div className="text-center py-10 text-muted-foreground">No notices sent yet.</div>}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Compose New Notice">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Notice Number</label>
                        <Input value={formData.noticeNumber} onChange={e => setFormData({ ...formData, noticeNumber: e.target.value })} required placeholder="e.g. NOT-2024-001" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Subject / Title</label>
                        <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tags (Press Enter to add)</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.tags.map(tag => (
                                <span key={tag} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">&times;</button>
                                </span>
                            ))}
                        </div>
                        <Input
                            value={tagName}
                            onChange={e => setTagName(e.target.value)}
                            onKeyDown={addTag}
                            placeholder="Type a tag and press Enter..."
                        />
                        <div className="flex flex-wrap gap-1 mt-2">
                            {predefinedTags.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => {
                                        if (!formData.tags.includes(tag)) {
                                            setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                                        }
                                    }}
                                    className="text-[10px] bg-secondary border px-2 py-0.5 rounded-full hover:bg-secondary/80 transition-colors"
                                >
                                    + {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Attachment (Optional)</label>
                        <div className="flex flex-col gap-2">
                            <Input
                                type="file"
                                onChange={e => {
                                    setFile(e.target.files?.[0] || null);
                                    setDriveFile(null);
                                }}
                                disabled={!!driveFile}
                            />

                            <div className="text-xs text-muted-foreground text-center">- OR -</div>

                            <Button
                                type="button"
                                variant={driveFile ? "default" : "outline"}
                                onClick={() => setIsDrivePickerOpen(true)}
                                disabled={!!file}
                                className="w-full justify-start"
                            >
                                {driveFile ? (
                                    <>
                                        <FileText size={16} className="mr-2" />
                                        Selected: {driveFile.name}
                                    </>
                                ) : (
                                    <>
                                        <Image size={16} className="mr-2" />
                                        Select from My Drive
                                    </>
                                )}
                            </Button>

                            {(file || driveFile) && (
                                <button
                                    type="button"
                                    onClick={() => { setFile(null); setDriveFile(null); }}
                                    className="text-xs text-destructive hover:underline text-left self-start"
                                >
                                    Remove attached file
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium">Select Recipients</label>
                            <button type="button" onClick={selectAll} className="text-xs text-primary hover:underline">
                                {formData.shopIds.length === shops.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                        <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1 bg-muted/20">
                            {shops.map(shop => (
                                <label key={shop._id} className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer text-sm">
                                    <input
                                        type="checkbox"
                                        checked={formData.shopIds.includes(shop._id)}
                                        onChange={() => toggleShopSelection(shop._id)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                                    />
                                    <span className="flex-1 font-medium">{shop.shopName}</span>
                                    <span className="text-muted-foreground text-xs">{shop.licenseNumber}</span>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground text-right">{formData.shopIds.length} shops selected</p>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={formData.shopIds.length === 0}><Send size={16} className="mr-2" /> Send Notice</Button>
                    </div>
                </form>
            </Modal>

            {/* Replies Modal */}
            <Modal isOpen={isRepliesModalOpen} onClose={() => setIsRepliesModalOpen(false)} title="Notice Replies">
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {loadingReplies ? (
                        <div className="text-center py-8 text-muted-foreground">Loading replies...</div>
                    ) : replies.length > 0 ? (
                        replies.map((reply, index) => (
                            <div key={reply._id} className="border rounded-md p-4 bg-muted/10 relative">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold">{reply.shopId?.shopName || 'Unknown Shop'}</h4>
                                    <span className="text-xs text-muted-foreground">{new Date(reply.createdAt).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{reply.message}</p>

                                {reply.attachmentUrl && (
                                    <a href={`http://localhost:5000${reply.attachmentUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs text-primary hover:underline gap-1 bg-white border px-2 py-1 rounded mb-3">
                                        <FileText size={12} /> View Shop Attachment
                                    </a>
                                )}

                                <div className="border-t pt-3 mt-3 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <label className="text-xs font-medium text-muted-foreground w-16">Status:</label>
                                        <select
                                            className="flex-1 text-sm border rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                            value={reply.status || 'pending'}
                                            onChange={(e) => {
                                                const newReplies = [...replies];
                                                newReplies[index] = { ...reply, status: e.target.value };
                                                setReplies(newReplies);
                                            }}
                                        >
                                            <option value="pending">⏳ Pending</option>
                                            <option value="under_review">🔍 Under Review</option>
                                            <option value="clarification">❓ Clarification Required</option>
                                            <option value="approved">✅ Approved</option>
                                            <option value="rejected">❌ Rejected</option>
                                        </select>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <label className="text-xs font-medium text-muted-foreground w-16 pt-1">Remarks:</label>
                                        <textarea
                                            className="flex-1 text-sm border rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px]"
                                            placeholder="Add remarks for shop..."
                                            value={reply.adminRemarks || ''}
                                            onChange={(e) => {
                                                const newReplies = [...replies];
                                                newReplies[index] = { ...reply, adminRemarks: e.target.value };
                                                setReplies(newReplies);
                                            }}
                                        />
                                    </div>
                                    <Button
                                        size="sm"
                                        className="w-full"
                                        onClick={async () => {
                                            try {
                                                await api.put(`/notices/${reply.noticeId}/status`, {
                                                    shopId: reply.shopId?._id,
                                                    status: reply.status || 'pending',
                                                    remarks: reply.adminRemarks || ''
                                                });
                                                toast.success('Status updated!');
                                            } catch (err) {
                                                toast.error('Failed to update status');
                                            }
                                        }}
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No replies received yet.</p>
                        </div>
                    )}
                </div>
                <div className="flex justify-end mt-4 pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsRepliesModalOpen(false)}>Close</Button>
                </div>
            </Modal>

            <DrivePicker
                isOpen={isDrivePickerOpen}
                onClose={() => setIsDrivePickerOpen(false)}
                onSelect={(file) => {
                    setDriveFile(file);
                    setFile(null);
                }}
            />
        </div>
    );
};

export default Notices;
