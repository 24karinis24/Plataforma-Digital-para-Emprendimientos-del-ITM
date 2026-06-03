using ITM.Emprendimientos.Domain.Entities;

namespace ITM.Emprendimientos.Domain.Interfaces.Repositories;

public interface IHorarioRepository : IGenericRepository<Horario>
{
    Task<IEnumerable<Horario>> ObtenerPorEmprendedorAsync(Guid emprendedorId);
}