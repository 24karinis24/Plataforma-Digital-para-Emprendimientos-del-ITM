using AutoMapper;
using ITM.Emprendimientos.Application.DTOs.Responses;
using ITM.Emprendimientos.Domain.Interfaces.Repositories;
using ITM.Emprendimientos.Domain.Strategies;

namespace ITM.Emprendimientos.Application.Services;

public class ProductoQueryService
{
    private readonly IProductoRepository _productoRepo;
    private readonly IMapper _mapper;
    private readonly ProductoFiltroStrategySelector _strategySelector;

    public ProductoQueryService(
        IProductoRepository productoRepo,
        IMapper mapper,
        ProductoFiltroStrategySelector strategySelector)
    {
        _productoRepo = productoRepo;
        _mapper = mapper;
        _strategySelector = strategySelector;
    }

    public async Task<IEnumerable<ProductoResponse>> ObtenerDisponiblesAsync(
     string? busqueda, string? categoriaId)
    {
        Guid? categoriaGuid = Guid.TryParse(categoriaId, out var g) ? g : null;

        var productos = await _productoRepo.ObtenerDisponiblesAsync(busqueda, categoriaGuid);
        var (estrategia, criterio) = _strategySelector.Seleccionar(busqueda, categoriaId);
        var productosFiltrados = estrategia.Filtrar(productos, criterio);
        return _mapper.Map<IEnumerable<ProductoResponse>>(productosFiltrados);
    }

    public async Task<IEnumerable<ProductoResponse>> ObtenerTodosParaAdminAsync(
        string? busqueda, string? categoriaId)
    {
        Guid? categoriaGuid = Guid.TryParse(categoriaId, out var g) ? g : null;
        return _mapper.Map<IEnumerable<ProductoResponse>>(
            await _productoRepo.ObtenerTodosParaAdminAsync(busqueda, categoriaGuid));
    }

    public async Task<IEnumerable<ProductoResponse>> ObtenerMisProductosAsync(Guid emprendedorId)
        => _mapper.Map<IEnumerable<ProductoResponse>>(
               await _productoRepo.ObtenerPorEmprendedorAsync(emprendedorId));

    public async Task<ProductoResponse> ObtenerDetalleAsync(Guid id)
    {
        var producto = await _productoRepo.ObtenerConDetalleAsync(id)
            ?? throw new KeyNotFoundException($"Producto con Id '{id}' no encontrado.");
        return _mapper.Map<ProductoResponse>(producto);
    }

    public async Task<ProductoStatsResponse> ObtenerEstadisticasAsync()
    {
        var (total, activos, inactivos) = await _productoRepo.ObtenerEstadisticasAsync();
        return new ProductoStatsResponse
        {
            Total = total,
            Activos = activos,
            Inactivos = inactivos
        };
    }
}