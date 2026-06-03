using ITM.Emprendimientos.DataAccess.Context;
using ITM.Emprendimientos.Domain.Entities;
using ITM.Emprendimientos.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ITM.Emprendimientos.DataAccess.Repositories;

public class CategoriaRepository : GenericRepository<Categoria>, ICategoriaRepository
{
    public CategoriaRepository(AppDbContext context) : base(context) { }

    public async Task<bool> ExisteNombreAsync(string nombre)
        => await _context.Categorias
                         .AnyAsync(c => c.Nombre.ToLower() == nombre.ToLower());
}