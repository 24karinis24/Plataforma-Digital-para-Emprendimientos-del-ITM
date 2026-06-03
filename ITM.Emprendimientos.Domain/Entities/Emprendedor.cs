using ITM.Emprendimientos.Domain.Enums;

namespace ITM.Emprendimientos.Domain.Entities;

/// <summary>
/// Usuario que publica y gestiona sus propios productos en la plataforma.
/// </summary>
public class Emprendedor : Usuario
{
    public string NombreEmprendimiento { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string? FotoUrl { get; set; }

    // Navigation Properties
    public ICollection<Producto> Productos { get; set; } = new List<Producto>();
    public ICollection<Horario> Horarios { get; set; } = new List<Horario>();
    public ICollection<Ubicacion> Ubicaciones { get; set; } = new List<Ubicacion>();

    public Emprendedor()
    {
        Tipo = TipoUsuario.Emprendedor;
    }
}