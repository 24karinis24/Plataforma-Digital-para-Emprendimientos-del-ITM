using ITM.Emprendimientos.DataAccess.Context;
using ITM.Emprendimientos.Domain.Entities;
using ITM.Emprendimientos.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ITM.Emprendimientos.DataAccess.Repositories;

public class AuditoriaRepository : GenericRepository<AuditoriaProducto>, IAuditoriaRepository
{
    public AuditoriaRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<AuditoriaProducto>> ObtenerPorProductoAsync(Guid productoId)
        => await _context.AuditoriasProducto
                         .Where(a => a.ProductoId == productoId)
                         .OrderByDescending(a => a.OcurridoEn)
                         .ToListAsync();
}