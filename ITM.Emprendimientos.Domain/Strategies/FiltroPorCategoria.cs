using ITM.Emprendimientos.Domain.Entities;

namespace ITM.Emprendimientos.Domain.Strategies;

/// <summary>
/// Estrategia: filtra productos que pertenecen a una categoría específica.
/// El criterio es el Id de la categoría como string (Guid.ToString()).
/// </summary>
public class FiltroPorCategoria : IProductoFiltroStrategy
{
    public IEnumerable<Producto> Filtrar(IEnumerable<Producto> productos, string criterio)
    {
        if (string.IsNullOrWhiteSpace(criterio) || !Guid.TryParse(criterio, out var categoriaId))
            return productos;

        return productos.Where(p => p.CategoriaId == categoriaId);
    }

    public string ObtenerNombre() => "FiltroPorCategoria";
}