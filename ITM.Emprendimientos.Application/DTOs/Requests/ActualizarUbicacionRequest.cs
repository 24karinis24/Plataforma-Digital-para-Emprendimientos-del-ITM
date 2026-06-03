namespace ITM.Emprendimientos.Application.DTOs.Requests;

public class ActualizarUbicacionRequest
{
    public string NombreSede { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string? ReferenciaMapa { get; set; }
}