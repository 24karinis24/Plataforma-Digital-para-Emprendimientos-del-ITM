using ITM.Emprendimientos.DataAccess.Context;
using ITM.Emprendimientos.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ITM.Emprendimientos.DataAccess.Repositories;

public class GenericRepository<T> : IGenericRepository<T> where T : AuditBase
{
    protected readonly AppDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public GenericRepository(AppDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public async Task<T?> ObtenerPorIdAsync(Guid id)
        => await _dbSet.FindAsync(id);

    public async Task<IEnumerable<T>> ObtenerTodosAsync()
        => await _dbSet.ToListAsync();

    public async Task AgregarAsync(T entidad)
    {
        entidad.CreadoEn = DateTime.UtcNow;
        await _dbSet.AddAsync(entidad);
        await _context.SaveChangesAsync();
    }

    public async Task ActualizarAsync(T entidad)
    {
        entidad.ActualizadoEn = DateTime.UtcNow;
        _dbSet.Update(entidad);
        await _context.SaveChangesAsync();
    }

    public async Task EliminarAsync(Guid id)
    {
        var entidad = await ObtenerPorIdAsync(id)
            ?? throw new KeyNotFoundException($"Registro con Id '{id}' no encontrado.");
        _dbSet.Remove(entidad);
        await _context.SaveChangesAsync();
    }
}