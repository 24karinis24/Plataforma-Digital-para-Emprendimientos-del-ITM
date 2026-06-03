using ITM.Emprendimientos.DataAccess.Context;
using ITM.Emprendimientos.Domain.Entities;
using ITM.Emprendimientos.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ITM.Emprendimientos.DataAccess.Repositories;

public class HorarioRepository : GenericRepository<Horario>, IHorarioRepository
{
    public HorarioRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Horario>> ObtenerPorEmprendedorAsync(Guid emprendedorId)
        => await _context.Horarios
                         .Where(h => h.EmprendedorId == emprendedorId)
                         .OrderBy(h => h.Dia)
                         .ToListAsync();
}