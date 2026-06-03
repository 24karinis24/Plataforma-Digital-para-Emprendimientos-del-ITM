namespace ITM.Emprendimientos.Domain.Strategies;

/// <summary>
/// Selecciona la estrategia de filtro correcta según los parámetros recibidos.
/// Aplica ISP: el servicio de consultas solo inyecta este selector,
/// no la lista completa de estrategias.
/// </summary>
public class ProductoFiltroStrategySelector
{
    private readonly IEnumerable<IProductoFiltroStrategy> _estrategias;

    public ProductoFiltroStrategySelector(IEnumerable<IProductoFiltroStrategy> estrategias)
    {
        _estrategias = estrategias;
    }

    /// <summary>
    /// Retorna la estrategia adecuada según los parámetros.
    /// Si se recibe categoriaId, tiene prioridad sobre el nombre.
    /// </summary>
    public (IProductoFiltroStrategy Estrategia, string Criterio) Seleccionar(
        string? busqueda,
        string? categoriaId)
    {
        if (!string.IsNullOrWhiteSpace(categoriaId))
        {
            var estrategia = _estrategias.First(e => e is FiltroPorCategoria);
            return (estrategia, categoriaId);
        }

        if (!string.IsNullOrWhiteSpace(busqueda))
        {
            var estrategia = _estrategias.First(e => e is FiltroPorNombre);
            return (estrategia, busqueda);
        }

        // Sin filtro: retorna estrategia de nombre con criterio vacío (retorna todos)
        var porNombre = _estrategias.First(e => e is FiltroPorNombre);
        return (porNombre, string.Empty);
    }
}