using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using GovtDesktop.Models;
using Newtonsoft.Json;

namespace GovtDesktop.Services
{
    public class ApiService
    {
        private readonly HttpClient _httpClient;
        private const string BaseUrl = "http://localhost:5000"; // Adjust if API has a prefix like /api

        public ApiService()
        {
            _httpClient = new HttpClient { BaseAddress = new Uri(BaseUrl) };
        }

        public async Task<List<FileItem>> GetFilesAsync(string? parentId = null)
        {
            try
            {
                var url = $"/files?parentId={parentId ?? "null"}";
                var response = await _httpClient.GetStringAsync(url);
                return JsonConvert.DeserializeObject<List<FileItem>>(response) ?? new List<FileItem>();
            }
            catch (Exception ex)
            {
                // Log error
                Console.WriteLine($"Error fetching files: {ex.Message}");
                return new List<FileItem>();
            }
        }

        public async Task<List<FileItem>> SearchFilesAsync(string query)
        {
            try
            {
                var response = await _httpClient.GetStringAsync($"/files/search?q={Uri.EscapeDataString(query)}");
                return JsonConvert.DeserializeObject<List<FileItem>>(response) ?? new List<FileItem>();
            }
            catch
            {
                return new List<FileItem>();
            }
        }

        public async Task<List<FileItem>> GetBreadcrumbsAsync(string folderId)
        {
            try
            {
                var response = await _httpClient.GetStringAsync($"/files/path/{folderId}");
                return JsonConvert.DeserializeObject<List<FileItem>>(response) ?? new List<FileItem>();
            }
            catch
            {
                return new List<FileItem>();
            }
        }

        public async Task CreateFolderAsync(string name, string? parentId)
        {
            var payload = new { name, parentId = parentId ?? "null" };
            var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");
            await _httpClient.PostAsync("/files/folder", content);
        }

        public async Task DeleteFileAsync(string id)
        {
            await _httpClient.DeleteAsync($"/files/{id}");
        }

        public async Task RenameFileAsync(string id, string newName)
        {
            var payload = new { name = newName };
            var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");
            await _httpClient.PutAsync($"/files/{id}", content);
        }
    }
}
