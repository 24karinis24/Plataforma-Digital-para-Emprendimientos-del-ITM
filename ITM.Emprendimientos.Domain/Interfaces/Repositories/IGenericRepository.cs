namespace ITM.Emprendimientos.Domain.Interfaces.Repositories;

/// <summary>
/// Contrato genérico de repositorio con operaciones CRUD comunes.
/// Todas las interfaces de repositorio específicas heredan de este.
/// </summary>
public interface IGenericRepository<T> where T : class
{
    Task<T?> ObtenerPorIdAsync(Guid id);
    Task<IEnumerable<T>> ObtenerTodosAsync();
    Task AgregarAsync(T entidad);
    Task ActualizarAsync(T entidad);
    Task EliminarAsync(Guid id);
}