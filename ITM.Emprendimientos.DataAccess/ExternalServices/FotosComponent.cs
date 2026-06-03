using ITM.Emprendimientos.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ITM.Emprendimientos.DataAccess.ExternalServices;

/// <summary>
/// Patrón: Adapter (implícito)
/// Implementa IFotosService adaptando la API de Supabase Storage.
/// La API y la capa de Application solo conocen IFotosService (DIP);
/// nunca referencian este componente directamente.
/// Si se reemplaza Supabase por AWS S3, solo cambia esta clase.
/// </summary>
public class FotosComponent : IFotosService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly ILogger<FotosComponent> _logger;

    private string SupabaseUrl => _config["Supabase:Url"] ?? string.Empty;
    private string SupabaseKey => _config["Supabase:Key"] ?? string.Empty;
    private string BucketName => _config["Supabase:BucketName"] ?? "productos-fotos";

    public FotosComponent(
        HttpClient httpClient,
        IConfiguration config,
        ILogger<FotosComponent> logger)
    {
        _httpClient = httpClient;
        _config = config;
        _logger = logger;
    }

    /// <summary>
    /// Sube una imagen al bucket de Supabase Storage y retorna la URL pública.
    /// </summary>
    public async Task<string> SubirFotoAsync(Stream imagen, string nombreArchivo, string contentType)
    {
        // Generar nombre único para evitar colisiones en el bucket
        var nombreUnico = $"{Guid.NewGuid():N}_{nombreArchivo}";
        var url = $"{SupabaseUrl}/storage/v1/object/{BucketName}/{nombreUnico}";

        using var content = new StreamContent(imagen);
        content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(contentType);

        var request = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = content
        };
        request.Headers.Add("apikey", SupabaseKey);
        request.Headers.Add("Authorization", $"Bearer {SupabaseKey}");

        var response = await _httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            _logger.LogError("Error subiendo foto a Supabase: {StatusCode} — {Error}",
                             response.StatusCode, error);
            throw new InvalidOperationException("No se pudo subir la imagen. Intente nuevamente.");
        }

        // Construir URL pública del objeto subido
        var urlPublica = $"{SupabaseUrl}/storage/v1/object/public/{BucketName}/{nombreUnico}";
        _logger.LogInformation("Foto subida exitosamente: {Url}", urlPublica);

        return urlPublica;
    }

    /// <summary>
    /// Elimina una imagen del bucket de Supabase a partir de su URL pública.
    /// </summary>
    public async Task EliminarFotoAsync(string url)
    {
        if (string.IsNullOrWhiteSpace(url)) return;

        // Extraer el path del objeto desde la URL pública
        var pathInicio = url.IndexOf($"/object/public/{BucketName}/",
                                      StringComparison.OrdinalIgnoreCase);
        if (pathInicio < 0)
        {
            _logger.LogWarning("URL de foto inválida para eliminar: {Url}", url);
            return;
        }

        var path = url[(pathInicio + $"/object/public/{BucketName}/".Length)..];
        var deleteUrl = $"{SupabaseUrl}/storage/v1/object/{BucketName}/{path}";

        var request = new HttpRequestMessage(HttpMethod.Delete, deleteUrl);
        request.Headers.Add("apikey", SupabaseKey);
        request.Headers.Add("Authorization", $"Bearer {SupabaseKey}");

        var response = await _httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
            _logger.LogWarning("No se pudo eliminar la foto de Supabase: {Url}", url);
        else
            _logger.LogInformation("Foto eliminada de Supabase: {Url}", url);
    }
}