using Microsoft.AspNetCore.Http;

namespace ITM.Emprendimientos.Application.DTOs.Requests;

/// <summary>Descripcion: máx 300</summary>
public class ActualizarPerfilAdminRequest
{
    public string? Descripcion { get; set; }
    public IFormFile? Foto { get; set; }
}