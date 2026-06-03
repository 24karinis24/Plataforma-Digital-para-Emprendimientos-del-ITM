using ITM.Emprendimientos.Domain.Entities;

namespace ITM.Emprendimientos.Domain.Strategies;

/// <summary>
/// Estrategia: filtra productos cuyo nombre contenga el criterio de búsqueda.
/// Búsqueda case-insensitive para consistencia con la demo v6.
/// </summary>
public class FiltroPorNombre : IProductoFiltroStrategy
{
    public IEnumerable<Producto> Filtrar(IEnumerable<Producto> productos, string criterio)
    {
        if (string.IsNullOrWhiteSpace(criterio))
            return productos;

        return productos.Where(p =>
            p.Nombre.Contains(criterio, StringComparison.OrdinalIgnoreCase));
    }

    public string ObtenerNombre() => "FiltroPorNombre";
}