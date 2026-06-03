namespace ITM.Emprendimientos.Application.DTOs.Responses;
/// <summary>
/// Respuesta del endpoint /login.
/// Incluye el token JWT y la información mínima del usuario
/// necesaria para que el frontend inicialice el store (rol, nombre, id).
/// </summary>
public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public Guid UsuarioId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public DateTime Expiracion { get; set; }
}