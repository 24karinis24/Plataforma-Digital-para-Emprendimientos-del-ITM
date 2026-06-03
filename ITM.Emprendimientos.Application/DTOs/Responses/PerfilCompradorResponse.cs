namespace ITM.Emprendimientos.Application.DTOs.Responses;

public class PerfilCompradorResponse
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Apodo { get; set; }
    public string? SobreTi { get; set; }
    public string? FotoUrl { get; set; }
    public string Rol { get; set; } = "Comprador";
}