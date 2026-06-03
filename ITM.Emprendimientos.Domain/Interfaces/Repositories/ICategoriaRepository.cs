using ITM.Emprendimientos.Domain.Entities;

namespace ITM.Emprendimientos.Domain.Interfaces.Repositories;

public interface ICategoriaRepository : IGenericRepository<Categoria>
{
    Task<bool> ExisteNombreAsync(string nombre);
}