namespace ITM.Emprendimientos.Application.DTOs.Responses;

public class UsuarioResponse
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public bool Habilitado { get; set; }
    public DateTime CreadoEn { get; set; }
}