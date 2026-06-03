using ITM.Emprendimientos.Domain.Enums;

namespace ITM.Emprendimientos.Domain.Entities;

/// <summary>
/// Clase base abstracta para todos los tipos de usuario del sistema.
/// Centraliza autenticación y datos comunes. No se puede instanciar directamente.
/// </summary>
public abstract class Usuario : AuditBase
{
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public TipoUsuario Tipo { get; set; }
    public bool Habilitado { get; set; } = true;
}