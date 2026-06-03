using ITM.Emprendimientos.Domain.Entities;

namespace ITM.Emprendimientos.Domain.Interfaces.Repositories;

public interface IProductoRepository : IGenericRepository<Producto>
{
    Task<IEnumerable<Producto>> ObtenerDisponiblesAsync(string? busqueda, Guid? categoriaId);
    Task<IEnumerable<Producto>> ObtenerTodosParaAdminAsync(string? busqueda, Guid? categoriaId);
    Task<IEnumerable<Producto>> ObtenerPorEmprendedorAsync(Guid emprendedorId);
    Task<Producto?> ObtenerConDetalleAsync(Guid id);
    Task<(int Total, int Activos, int Inactivos)> ObtenerEstadisticasAsync();
    Task PropagarpPerfilAProductosAsync(
    Guid emprendedorId,
    string nuevoNombreEmprendimiento,
    string nuevaDescripcion,
    string? nuevaFotoUrl);
}