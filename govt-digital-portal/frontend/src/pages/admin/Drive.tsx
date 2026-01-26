import FileExplorer from '../../components/drive/FileExplorer';

const Drive = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">System Drive</h1>
            <p className="text-muted-foreground">Manage centralized documents and files.</p>
            <FileExplorer />
        </div>
    );
};
export default Drive;
