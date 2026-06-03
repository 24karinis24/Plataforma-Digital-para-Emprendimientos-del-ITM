namespace ITM.Emprendimientos.Application.DTOs.Requests;

public class RegistroRequest
{
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    /// <summary>0=Administrador | 1=Emprendedor | 2=Comprador</summary>
    public int TipoUsuario { get; set; }
}