using ITM.Emprendimientos.Domain.Entities;

namespace ITM.Emprendimientos.Domain.Strategies;

/// <summary>
/// Patrón: Strategy
/// Define el contrato para los algoritmos de filtrado del catálogo.
/// El cliente (ProductoQueryService) trabaja contra esta interfaz;
/// nunca conoce la implementación concreta seleccionada.
/// </summary>
public interface IProductoFiltroStrategy
{
    /// <summary>
    /// Aplica el filtro a la colección de productos.
    /// </summary>
    /// <param name="productos">Colección fuente ya cargada desde el repositorio.</param>
    /// <param name="criterio">Valor de búsqueda ingresado por el usuario.</param>
    IEnumerable<Producto> Filtrar(IEnumerable<Producto> productos, string criterio);

    /// <summary>Nombre de la estrategia (para logging y debugging).</summary>
    string ObtenerNombre();
}