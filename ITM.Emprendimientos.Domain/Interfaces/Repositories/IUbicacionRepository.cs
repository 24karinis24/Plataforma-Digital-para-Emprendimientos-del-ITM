using ITM.Emprendimientos.Domain.Entities;

namespace ITM.Emprendimientos.Domain.Interfaces.Repositories;

public interface IUbicacionRepository : IGenericRepository<Ubicacion>
{
    Task<IEnumerable<Ubicacion>> ObtenerPorEmprendedorAsync(Guid emprendedorId);
}