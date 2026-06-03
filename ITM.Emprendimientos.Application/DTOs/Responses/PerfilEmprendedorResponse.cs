namespace ITM.Emprendimientos.Application.DTOs.Responses;

public class PerfilEmprendedorResponse
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string NombreEmprendimiento { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string? FotoUrl { get; set; }
    public string Rol { get; set; } = "Emprendedor";
}