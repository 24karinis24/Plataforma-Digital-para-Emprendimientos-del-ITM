using ITM.Emprendimientos.Domain.Entities;

namespace ITM.Emprendimientos.Domain.Interfaces.Repositories;

public interface IUsuarioRepository : IGenericRepository<Usuario>
{
    Task<Usuario?> ObtenerPorEmailAsync(string email);
    Task<bool> ExisteEmailAsync(string email);
}