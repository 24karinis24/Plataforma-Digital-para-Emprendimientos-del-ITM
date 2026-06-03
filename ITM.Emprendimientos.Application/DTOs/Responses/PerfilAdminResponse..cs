namespace ITM.Emprendimientos.Application.DTOs.Responses;

public class PerfilAdminResponse
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? FotoUrl { get; set; }
    public string Rol { get; set; } = "Administrador";
}