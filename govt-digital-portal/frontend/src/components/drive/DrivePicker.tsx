import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Button } from '../ui/Button';
import Modal from '../ui/Modal';
import { Folder, FileText, ArrowLeft, Check } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (file: any) => void;
}

const DrivePicker = ({ isOpen, onClose, onSelect }: Props) => {
    const [files, setFiles] = useState<any[]>([]);
    const [currentFolder, setCurrentFolder] = useState<any | null>(null);
    const [folderHistory, setFolderHistory] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<any | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchFiles(currentFolder?._id);
            setSelectedFile(null);
        }
    }, [isOpen, currentFolder]);

    const fetchFiles = async (parentId = null) => {
        try {
            const { data } = await api.get(`/files?parentId=${parentId || 'null'}`);
            setFiles(data);
        } catch (error) {
            console.error(error);
        }
    };

    const openFolder = (folder: any) => {
        setFolderHistory([...folderHistory, currentFolder]);
        setCurrentFolder(folder);
        setSelectedFile(null);
    };

    const goBack = () => {
        const prev = folderHistory[folderHistory.length - 1];
        setFolderHistory(folderHistory.slice(0, -1));
        setCurrentFolder(prev);
        setSelectedFile(null);
    };

    const handleConfirm = () => {
        if (selectedFile) {
            onSelect(selectedFile);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Select File from Drive">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2 pb-2 border-b">
                    {currentFolder ? (
                        <Button variant="ghost" size="sm" onClick={goBack} className="h-8 w-8 p-0">
                            <ArrowLeft size={16} />
                        </Button>
                    ) : (
                        <Folder size={20} className="text-primary ml-2" />
                    )}
                    <span className="font-semibold text-sm truncate">
                        {currentFolder ? currentFolder.name : "My Drive"}
                    </span>
                </div>

                {/* File Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto p-1">
                    {files.length === 0 && (
                        <div className="col-span-full py-8 text-center text-muted-foreground text-sm">
                            Folder is empty
                        </div>
                    )}

                    {files.map(file => (
                        <div
                            key={file._id}
                            onClick={() => file.type === 'folder' ? openFolder(file) : setSelectedFile(file)}
                            className={`
                                p-3 border rounded-lg cursor-pointer transition-all relative
                                ${file.type === 'folder' ? 'hover:bg-primary/5 bg-muted/20' : ''}
                                ${selectedFile?._id === file._id ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:border-primary/50'}
                            `}
                        >
                            <div className="flex flex-col items-center gap-2 text-center">
                                {file.type === 'folder' ? (
                                    <Folder size={32} className="text-primary fill-primary/10" />
                                ) : (
                                    <FileText size={32} className="text-muted-foreground" />
                                )}
                                <span className="text-xs font-medium truncate w-full">{file.name}</span>
                            </div>

                            {selectedFile?._id === file._id && (
                                <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-0.5">
                                    <Check size={10} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                        {selectedFile ? `Selected: ${selectedFile.name}` : 'No file selected'}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
                        <Button size="sm" disabled={!selectedFile} onClick={handleConfirm}>Select File</Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default DrivePicker;
