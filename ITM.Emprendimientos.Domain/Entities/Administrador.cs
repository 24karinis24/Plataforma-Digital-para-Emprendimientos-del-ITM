using ITM.Emprendimientos.Domain.Enums;

namespace ITM.Emprendimientos.Domain.Entities;

/// <summary>
/// Usuario con capacidad de moderar el catálogo completo:
/// habilitar/deshabilitar productos y gestionar usuarios.
/// </summary>
public class Administrador : Usuario
{
    public string? Descripcion { get; set; }
    public string? FotoUrl { get; set; }

    public Administrador()
    {
        Tipo = TipoUsuario.Administrador;
    }
}