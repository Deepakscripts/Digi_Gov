using Newtonsoft.Json;

namespace GovtDesktop.Models
{
    public class FileItem
    {
        [JsonProperty("_id")]
        public string Id { get; set; } = string.Empty;

        [JsonProperty("name")]
        public string Name { get; set; } = string.Empty;

        [JsonProperty("type")]
        public string Type { get; set; } = "file"; // "folder" or "file"

        [JsonProperty("size")]
        public long Size { get; set; }

        [JsonProperty("url")]
        public string Url { get; set; } = string.Empty;

        [JsonProperty("parentId")]
        public string? ParentId { get; set; }

        [JsonProperty("remarks")]
        public string? Remarks { get; set; }

        public bool IsFolder => Type == "folder";
    }
}
