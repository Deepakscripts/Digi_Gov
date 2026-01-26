using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GovtDesktop.Models;
using GovtDesktop.Services;
using System.Collections.ObjectModel;
using System.Windows;

namespace GovtDesktop.ViewModels
{
    public partial class MainViewModel : ObservableObject
    {
        private readonly ApiService _apiService;

        [ObservableProperty]
        private ObservableCollection<FileItem> _files = new();

        [ObservableProperty]
        private ObservableCollection<FileItem> _breadcrumbs = new();

        [ObservableProperty]
        private ObservableCollection<FileItem> _areas = new();

        [ObservableProperty]
        private FileItem? _selectedArea;

        [ObservableProperty]
        private FileItem? _currentFolder;

        [ObservableProperty]
        private string _searchQuery = "";

        [ObservableProperty]
        private bool _isSearching;

        [ObservableProperty]
        private bool _isLoading;

        [ObservableProperty]
        private string _statusMessage = "Ready";

        public MainViewModel()
        {
            _apiService = new ApiService();
            LoadFilesCommand.Execute(null);
            LoadAreas();
        }

        private async void LoadAreas()
        {
            try
            {
                // Fetch root files and filter for folders
                var roots = await _apiService.GetFilesAsync("null");
                Areas.Clear();
                foreach (var item in roots.Where(x => x.Type == "folder"))
                {
                    Areas.Add(item);
                }
            }
            catch { }
        }

        partial void OnSelectedAreaChanged(FileItem? value)
        {
            if (value != null)
            {
                NavigateBreadcrumbCommand.Execute(value);
            }
            else
            {
                // If set to null explicitly (and not just by navigation), maybe go Home?
                // But navigation updates CurrentFolder, this is a distinct action.
                // We'll leave it be to avoid loops.
            }
        }

        [RelayCommand]
        public async Task LoadFiles()
        {
            IsLoading = true;
            StatusMessage = "Loading...";
            try
            {
                var parentId = CurrentFolder?.Id;
                var items = await _apiService.GetFilesAsync(parentId);
                Files.Clear();
                foreach (var item in items) Files.Add(item);

                if (CurrentFolder != null)
                {
                    var path = await _apiService.GetBreadcrumbsAsync(CurrentFolder.Id);
                    Breadcrumbs.Clear();
                    foreach (var p in path) Breadcrumbs.Add(p);
                }
                else
                {
                    Breadcrumbs.Clear();
                }
            }
            catch (Exception ex)
            {
                StatusMessage = "Error: " + ex.Message;
            }
            finally
            {
                IsLoading = false;
                StatusMessage = "Ready";
            }
        }

        [RelayCommand]
        public async Task PerformSearch()
        {
            if (string.IsNullOrWhiteSpace(SearchQuery))
            {
                IsSearching = false;
                await LoadFiles();
                return;
            }

            IsSearching = true;
            IsLoading = true;
            try
            {
                var results = await _apiService.SearchFilesAsync(SearchQuery);
                Files.Clear();
                foreach (var item in results) Files.Add(item);
            }
            finally
            {
                IsLoading = false;
            }
        }

        [RelayCommand]
        public async Task OpenItem(FileItem item)
        {
            if (item.IsFolder)
            {
                CurrentFolder = item;
                SearchQuery = "";
                IsSearching = false;
                await LoadFiles();
            }
            else
            {
                // Open file logic - typically launch default browser or app
                try
                {
                    var fullUrl = $"http://localhost:5000{item.Url}";
                    var psi = new System.Diagnostics.ProcessStartInfo
                    {
                        FileName = fullUrl,
                        UseShellExecute = true
                    };
                    System.Diagnostics.Process.Start(psi);
                }
                catch { }
            }
        }

        [RelayCommand]
        public async Task GoHome()
        {
            CurrentFolder = null;
            IsSearching = false;
            SearchQuery = "";
            await LoadFiles();
        }

        [RelayCommand]
        public async Task NavigateBreadcrumb(FileItem folder)
        {
            CurrentFolder = folder;
            await LoadFiles();
        }

        [RelayCommand]
        public async Task CreateFolder(string folderName)
        {
            if (string.IsNullOrWhiteSpace(folderName)) return;
            await _apiService.CreateFolderAsync(folderName, CurrentFolder?.Id);
            await LoadFiles();
        }

        [RelayCommand]
        public async Task DeleteItem(FileItem item)
        {
            var result = MessageBox.Show($"Delete {item.Name}?", "Confirm", MessageBoxButton.YesNo);
            if (result == MessageBoxResult.Yes)
            {
                await _apiService.DeleteFileAsync(item.Id);
                if (IsSearching) await PerformSearch();
                else await LoadFiles();
            }
        }
    }
}
