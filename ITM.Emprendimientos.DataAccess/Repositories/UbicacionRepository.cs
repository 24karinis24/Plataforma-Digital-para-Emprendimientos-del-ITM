using ITM.Emprendimientos.DataAccess.Context;
using ITM.Emprendimientos.Domain.Entities;
using ITM.Emprendimientos.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ITM.Emprendimientos.DataAccess.Repositories;

public class UbicacionRepository : GenericRepository<Ubicacion>, IUbicacionRepository
{
    public UbicacionRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Ubicacion>> ObtenerPorEmprendedorAsync(Guid emprendedorId)
        => await _context.Ubicaciones
                         .Where(u => u.EmprendedorId == emprendedorId)
                         .ToListAsync();
}