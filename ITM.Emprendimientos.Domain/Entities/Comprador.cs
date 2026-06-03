using ITM.Emprendimientos.Domain.Enums;

namespace ITM.Emprendimientos.Domain.Entities;

/// <summary>
/// Usuario que navega el catálogo y consulta productos y perfiles de emprendedores.
/// </summary>
public class Comprador : Usuario
{
    public string? Apodo { get; set; }
    public string? SobreTi { get; set; }
    public string? FotoUrl { get; set; }

    public Comprador()
    {
        Tipo = TipoUsuario.Comprador;
    }
}