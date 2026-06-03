using ITM.Emprendimientos.Domain.Entities;

namespace ITM.Emprendimientos.Domain.Interfaces.Repositories;

public interface IAuditoriaRepository : IGenericRepository<AuditoriaProducto>
{
    Task<IEnumerable<AuditoriaProducto>> ObtenerPorProductoAsync(Guid productoId);
}
