import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import Modal from '../ui/Modal';
import { Folder, FileText, Upload, Plus, Trash2, Home, Eye, X, Search, Loader2, Edit2, MessageSquare, ChevronRight, Cloud, File as FileIcon, MapPin, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const FileExplorer = () => {
    const [files, setFiles] = useState<any[]>([]);
    const [currentFolder, setCurrentFolder] = useState<any | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isFolderOpen, setIsFolderOpen] = useState(false);
    const [newItemName, setNewItemName] = useState('');

    // Upload State
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [previewFile, setPreviewFile] = useState<any | null>(null);

    // Rename State
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [itemToRename, setItemToRename] = useState<any | null>(null);
    const [renameName, setRenameName] = useState('');

    // Remark State
    const [isRemarkOpen, setIsRemarkOpen] = useState(false);
    const [itemToRemark, setItemToRemark] = useState<any | null>(null);
    const [remarkText, setRemarkText] = useState('');

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchLoading, setIsSearchLoading] = useState(false);

    // Filter/Area State
    const [areas, setAreas] = useState<any[]>([]);

    useEffect(() => {
        // Fetch Areas (Root Folders) for the filter dropdown
        const fetchAreas = async () => {
            try {
                const { data } = await api.get('/files?parentId=null');
                setAreas(data.filter((f: any) => f.type === 'folder'));
            } catch (e) { console.error("Failed to load areas"); }
        };
        fetchAreas();
    }, [isFolderOpen]); // Refresh areas when a new folder might be created


    useEffect(() => {
        if (!isSearching) {
            fetchFiles(currentFolder?._id);
        }

        if (currentFolder && !isSearching) {
            api.get(`/files/path/${currentFolder._id}`)
                .then(res => setBreadcrumbs(res.data))
                .catch(err => console.error(err));
        } else if (!currentFolder) {
            setBreadcrumbs([]);
        }
    }, [currentFolder, isSearching]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                performSearch(searchQuery);
            } else if (searchQuery === '' && isSearching) {
                setIsSearching(false);
                fetchFiles(currentFolder?._id);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [searchQuery, currentFolder]);

    const performSearch = async (query: string) => {
        setIsSearching(true);
        setIsSearchLoading(true);
        try {
            const { data } = await api.get(`/files/search?q=${query}`);
            setFiles(data);
        } catch (error) {
            console.error(error);
            toast.error("Search failed");
        } finally {
            setIsSearchLoading(false);
        }
    };

    const fetchFiles = async (parentId = null) => {
        try {
            const { data } = await api.get(`/files?parentId=${parentId || 'null'}`);
            setFiles(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleManualSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            performSearch(searchQuery);
        }
    }

    const clearSearch = () => {
        setSearchQuery('');
        setIsSearching(false);
    };

    // Upload Logic
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setUploadFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setUploadFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
        }
    };

    const removeFileFromUpload = (index: number) => {
        setUploadFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (uploadFiles.length === 0) return;

        setIsUploading(true);
        const data = new FormData();
        uploadFiles.forEach(file => {
            data.append('files', file);
        });

        if (currentFolder) data.append('parentId', currentFolder._id);
        else data.append('parentId', 'null');

        try {
            await api.post('/files/upload', data);
            toast.success(`${uploadFiles.length} file(s) uploaded`);
            setIsUploadOpen(false);
            setUploadFiles([]);
            if (!isSearching) fetchFiles(currentFolder?._id);
            else performSearch(searchQuery);
        } catch (error: any) {
            toast.error(error.message || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/files/folder', {
                name: newItemName,
                parentId: currentFolder?._id || 'null'
            });
            toast.success('Folder created');
            setIsFolderOpen(false);
            setNewItemName('');
            if (!isSearching) fetchFiles(currentFolder?._id);
            else performSearch(searchQuery);
        } catch (error) {
            toast.error('Failed to create folder');
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Delete this item? It will permanently delete all contents.")) return;
        try {
            await api.delete(`/files/${id}`);
            toast.success('Deleted');
            if (isSearching) {
                performSearch(searchQuery);
            } else {
                fetchFiles(currentFolder?._id);
            }
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    // Rename Logic
    const openRenameModal = (e: React.MouseEvent, item: any) => {
        e.stopPropagation();
        setItemToRename(item);
        setRenameName(item.name);
        setIsRenameOpen(true);
    };

    const handleRename = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemToRename || !renameName.trim()) return;

        try {
            await api.put(`/files/${itemToRename._id}`, { name: renameName });
            toast.success('Renamed successfully');
            setIsRenameOpen(false);
            setItemToRename(null);
            if (isSearching) performSearch(searchQuery); else fetchFiles(currentFolder?._id);
        } catch (error) {
            toast.error('Failed to rename');
        }
    }

    // Remark Logic
    const openRemarkModal = (e: React.MouseEvent, item: any) => {
        e.stopPropagation();
        setItemToRemark(item);
        setRemarkText(item.remarks || '');
        setIsRemarkOpen(true);
    };

    const handleSaveRemark = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemToRemark) return;

        try {
            await api.put(`/files/${itemToRemark._id}`, { remarks: remarkText });
            toast.success('Remark saved');
            setIsRemarkOpen(false);
            setItemToRemark(null);
            if (isSearching) performSearch(searchQuery); else fetchFiles(currentFolder?._id);
        } catch (error) {
            toast.error('Failed to save remark');
        }
    }

    const openFolder = (folder: any) => {
        if (isSearching) {
            setIsSearching(false);
            setSearchQuery('');
        }
        setCurrentFolder(folder);
    };

    const navigateToBreadcrumb = (folder: any) => {
        openFolder(folder);
    };

    const goHome = () => {
        setCurrentFolder(null);
        setIsSearching(false);
        setSearchQuery('');
    }

    const handleFileClick = (file: any) => {
        if (file.type === 'folder') {
            openFolder(file);
        } else {
            const ext = file.name.split('.').pop().toLowerCase();
            const isPreviewable = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);

            if (isPreviewable) {
                setPreviewFile(file);
            } else {
                window.open(`http://localhost:5000${file.url}`, '_blank');
            }
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            {/* Header Toolbar */}
            <div className="flex flex-col gap-6 bg-card/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-border/50 shadow-sm">

                {/* Search Bar & Area Filter */}
                <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row gap-3 w-full max-w-3xl mx-auto items-center">

                    {/* Area Filter Dropdown */}
                    <div className="relative w-full sm:w-48 group z-20">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-primary z-10 pointer-events-none">
                            <MapPin size={18} />
                        </div>
                        <select
                            className="w-full h-12 pl-10 pr-10 rounded-xl border-muted bg-background/50 focus:bg-background border outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer text-sm font-medium text-foreground/80 truncate shadow-sm hover:border-primary/30"
                            value={breadcrumbs.length > 0 ? breadcrumbs[0]._id : ''}
                            onChange={(e) => {
                                const areaId = e.target.value;
                                if (!areaId) goHome();
                                else {
                                    const area = areas.find(a => a._id === areaId);
                                    if (area) openFolder(area);
                                }
                            }}
                        >
                            <option value="">All Areas</option>
                            {areas.map(area => (
                                <option key={area._id} value={area._id}>{area.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                            <ChevronDown size={16} />
                        </div>
                    </div>

                    <div className="relative flex-1 group w-full">
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isSearching ? 'text-primary' : 'text-muted-foreground'}`} size={20} />
                        <Input
                            placeholder="Type to search..."
                            className="pl-11 h-12 rounded-xl border-muted bg-background/50 focus:bg-background transition-all shadow-sm focus:ring-2 focus:ring-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {isSearchLoading ? (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 className="animate-spin text-primary" size={18} />
                            </div>
                        ) : searchQuery ? (
                            <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                                <X size={18} />
                            </button>
                        ) : null}
                    </div>
                </form>

                {/* Breadcrumbs & Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-border/50 pt-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm font-medium overflow-hidden">
                        <Button variant="ghost" size="sm" onClick={goHome} className={`gap-2 px-3 rounded-lg ${!currentFolder && !isSearching ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                            <Home size={18} />
                            {breadcrumbs.length === 0 && !isSearching && "Home"}
                        </Button>

                        {!isSearching && breadcrumbs.map((folder, index) => (
                            <div key={folder._id} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                <ChevronRight size={16} className="text-muted-foreground/50" />
                                <button
                                    onClick={() => navigateToBreadcrumb(folder)}
                                    className={`hover:bg-muted px-2 py-1 rounded-md transition-all truncate max-w-[120px] sm:max-w-none ${index === breadcrumbs.length - 1 ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    {folder.name}
                                </button>
                            </div>
                        ))}

                        {!isSearching && currentFolder && breadcrumbs.length > 0 && breadcrumbs[breadcrumbs.length - 1]?._id !== currentFolder._id && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                <ChevronRight size={16} className="text-muted-foreground/50" />
                                <span className="font-semibold text-foreground px-2 py-1 bg-muted/50 rounded-md truncate max-w-[150px]">{currentFolder.name}</span>
                            </div>
                        )}

                        {isSearching && (
                            <div className="flex items-center gap-2">
                                <ChevronRight size={16} className="text-muted-foreground" />
                                <span className="text-primary font-medium">Search Results</span>
                                {files.length > 0 && <span className="text-muted-foreground text-xs ml-1">({files.length} found)</span>}
                            </div>
                        )}
                    </div>

                    {!isSearching && (
                        <div className="flex gap-3 w-full sm:w-auto">
                            <Button variant="outline" onClick={() => setIsFolderOpen(true)} className="flex-1 sm:flex-none h-10 rounded-lg border-primary/20 hover:border-primary/50 hover:bg-primary/5 text-primary">
                                <Plus size={18} className="mr-2" />
                                {currentFolder ? "New Folder" : "New Area"}
                            </Button>
                            <Button onClick={() => { setIsUploadOpen(true); setUploadFiles([]); }} className="flex-1 sm:flex-none h-10 rounded-lg bg-primary hover:bg-primary/90 text-white">
                                <Upload size={18} className="mr-2" /> Upload
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* File Gird */}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
                {files.length === 0 && (
                    <div className="col-span-full py-20 sm:py-32 text-center text-muted-foreground border-2 border-dashed border-muted-foreground/20 rounded-2xl bg-muted/5">
                        <div className="bg-background w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            {isSearching ? <Search className="h-10 w-10 text-muted-foreground/30" /> : <Folder className="h-10 w-10 text-muted-foreground/30" />}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">{isSearching ? "No matches found" : "Empty Folder"}</h3>
                        <p className="text-sm mt-1 max-w-xs mx-auto text-muted-foreground/80">{isSearching ? `No results for "${searchQuery}"` : "Create a new folder or upload files to get started."}</p>
                    </div>
                )}

                {files.map((file, i) => (
                    <div
                        key={file._id}
                        onClick={() => handleFileClick(file)}
                        className={`
                            group relative bg-card border rounded-2xl p-5 cursor-pointer 
                            transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30
                            flex flex-col items-center justify-between min-h-[160px] animate-in fade-in zoom-in-95 duration-300
                            ${file.type === 'folder' ? 'bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 border-blue-100/50 dark:border-blue-800/20' : 'hover:bg-muted/30'}
                        `}
                        style={{ animationDelay: `${i * 50}ms` }}
                    >
                        {/* Type Icon */}
                        <div className={`
                            w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm transition-transform group-hover:scale-110 duration-300
                            ${file.type === 'folder' ? 'bg-blue-100/50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-orange-100/50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'}
                        `}>
                            {file.type === 'folder' ? <Folder size={32} className="fill-current/20" /> : <FileText size={32} />}
                        </div>

                        {/* Name & Meta */}
                        <div className="w-full text-center space-y-1">
                            <h3 className="font-semibold text-sm truncate w-full px-1 text-foreground/90 group-hover:text-primary transition-colors" title={file.name}>
                                {file.name}
                            </h3>
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                                {file.type === 'folder' ? 'Folder' : `${(file.size / 1024).toFixed(1)} KB`}
                            </p>
                        </div>

                        {/* Remarks Badge */}
                        {file.remarks && (
                            <button
                                onClick={(e) => openRemarkModal(e, file)}
                                className="absolute top-3 right-3 z-10 outline-none transform transition-transform hover:scale-105 active:scale-95"
                                title="View/Edit Remark"
                            >
                                <span className="flex items-center gap-1 text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full border border-yellow-200 shadow-sm hover:bg-yellow-200 hover:shadow-md transition-all">
                                    <MessageSquare size={10} className="fill-yellow-700/20" /> Note
                                </span>
                            </button>
                        )}

                        {/* Hover Actions Overlay */}
                        <div className="absolute inset-x-3 bottom-3 flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                            <div className="bg-background/90 backdrop-blur-sm p-1.5 rounded-xl border shadow-lg flex items-center gap-1">
                                {file.type === 'file' && (
                                    <button onClick={(e) => { e.stopPropagation(); setPreviewFile(file); }} className="p-2 text-foreground/70 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Preview"><Eye size={16} /></button>
                                )}
                                <button onClick={(e) => openRenameModal(e, file)} className="p-2 text-foreground/70 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Rename"><Edit2 size={16} /></button>
                                <button onClick={(e) => openRemarkModal(e, file)} className="p-2 text-foreground/70 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Remark"><MessageSquare size={16} /></button>
                                <div className="w-px h-4 bg-border mx-0.5"></div>
                                <button onClick={(e) => handleDelete(file._id, e)} className="p-2 text-foreground/70 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Upload Modal (Revamped with Drag and Drop & Bulk) */}
            <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Files">
                <form onSubmit={handleUploadSubmit} className="space-y-4">
                    <div
                        className={`
                            border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
                            ${isDragOver ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30'}
                        `}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-upload-input')?.click()}
                    >
                        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                            <Cloud size={32} />
                        </div>
                        <h4 className="font-semibold text-lg mb-1">Click to upload or drag and drop</h4>
                        <p className="text-sm text-muted-foreground mb-4">SVG, PNG, JPG or PDF (max. 10MB)</p>
                        <Input
                            id="file-upload-input"
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                    </div>

                    {uploadFiles.length > 0 && (
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            <h5 className="text-sm font-medium text-muted-foreground">Selected ({uploadFiles.length})</h5>
                            {uploadFiles.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-muted/40 p-2 rounded-lg border text-sm">
                                    <div className="flex items-center gap-2 truncate">
                                        <FileIcon size={14} className="text-primary shrink-0" />
                                        <span className="truncate max-w-[200px]">{file.name}</span>
                                    </div>
                                    <button type="button" onClick={() => removeFileFromUpload(idx)} className="text-muted-foreground hover:text-destructive p-1">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={uploadFiles.length === 0 || isUploading} className="min-w-[100px]">
                            {isUploading ? <Loader2 className="animate-spin" size={18} /> : `Upload ${uploadFiles.length > 0 ? `(${uploadFiles.length})` : ''}`}
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isFolderOpen} onClose={() => setIsFolderOpen(false)} title="Create New Folder">
                <form onSubmit={handleCreateFolder} className="space-y-4">
                    <div className="bg-primary/5 p-3 rounded-lg border border-primary/10 text-sm text-primary flex items-start gap-2">
                        <Folder size={16} className="mt-0.5 shrink-0" />
                        {currentFolder ? `Creating inside: ${currentFolder.name}` : `Tip: Create an "Area" folder to organize your shops.`}
                    </div>
                    <Input placeholder={currentFolder ? "Folder Name" : "Area Name"} value={newItemName} onChange={e => setNewItemName(e.target.value)} autoFocus required className="h-11" />
                    <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setIsFolderOpen(false)}>Cancel</Button><Button type="submit">Create</Button></div>
                </form>
            </Modal>

            <Modal isOpen={isRenameOpen} onClose={() => setIsRenameOpen(false)} title="Rename Item">
                <form onSubmit={handleRename} className="space-y-4">
                    <Input placeholder="New Name" value={renameName} onChange={e => setRenameName(e.target.value)} autoFocus required className="h-11" />
                    <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setIsRenameOpen(false)}>Cancel</Button><Button type="submit">Save Changes</Button></div>
                </form>
            </Modal>

            <Modal isOpen={isRemarkOpen} onClose={() => setIsRemarkOpen(false)} title="File Note">
                <form onSubmit={handleSaveRemark} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/80">Add Note/Remark</label>
                        <textarea
                            className="flex min-h-[120px] w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Enter remarks here..."
                            value={remarkText}
                            onChange={e => setRemarkText(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setIsRemarkOpen(false)}>Cancel</Button><Button type="submit">Save Note</Button></div>
                </form>
            </Modal>

            {previewFile && (
                <div className="fixed inset-0 bg-black z-[100] flex flex-col">
                    {/* Header Bar */}
                    <div className="flex-shrink-0 p-3 flex justify-between items-center bg-zinc-900 border-b border-zinc-800">
                        <h3 className="font-semibold truncate pr-4 text-base text-white flex-1">{previewFile.name}</h3>
                        <div className="flex items-center gap-2">
                            <a
                                href={`/govapi/files/download/${previewFile._id}`}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <FileText size={16} /> Download
                            </a>
                            <button onClick={() => setPreviewFile(null)} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"><X size={24} /></button>
                        </div>
                    </div>
                    {/* Content Area - Full Height */}
                    <div className="flex-1 overflow-hidden flex items-center justify-center bg-zinc-950">
                        {previewFile.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img src={`/govapi/files/view/${previewFile._id}`} className="max-w-full max-h-full object-contain" alt={previewFile.name} />
                        ) : previewFile.name.match(/\.pdf$/i) ? (
                            <iframe src={`/govapi/files/view/${previewFile._id}`} className="w-full h-full bg-white" title={previewFile.name} />
                        ) : (
                            <div className="text-center p-12 text-white">
                                <FileText size={64} className="mx-auto mb-6 opacity-30" />
                                <p className="text-xl font-medium">Preview not available</p>
                                <a
                                    href={`/govapi/files/download/${previewFile._id}`}
                                    className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 inline-block"
                                >
                                    Download File
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileExplorer;
