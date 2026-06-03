using Microsoft.AspNetCore.Http;

namespace ITM.Emprendimientos.Application.DTOs.Requests;

/// <summary>Apodo: máx 50 | SobreTi: máx 300</summary>
public class ActualizarPerfilCompradorRequest
{
    public string? Apodo { get; set; }
    public string? SobreTi { get; set; }
    public IFormFile? Foto { get; set; }
}