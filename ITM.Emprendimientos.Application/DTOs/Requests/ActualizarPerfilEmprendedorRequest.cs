using Microsoft.AspNetCore.Http;

namespace ITM.Emprendimientos.Application.DTOs.Requests;

/// <summary>NombreEmprendimiento: máx 100 | Descripcion: máx 500</summary>
public class ActualizarPerfilEmprendedorRequest
{
    public string NombreEmprendimiento { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public IFormFile? Foto { get; set; }
}