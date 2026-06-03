using ITM.Emprendimientos.DataAccess.Context;
using ITM.Emprendimientos.Domain.Entities;
using ITM.Emprendimientos.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ITM.Emprendimientos.DataAccess.Repositories;

public class UsuarioRepository : GenericRepository<Usuario>, IUsuarioRepository
{
    public UsuarioRepository(AppDbContext context) : base(context) { }

    public async Task<Usuario?> ObtenerPorEmailAsync(string email)
        => await _context.Usuarios
                         .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

    public async Task<bool> ExisteEmailAsync(string email)
        => await _context.Usuarios
                         .AnyAsync(u => u.Email.ToLower() == email.ToLower());
}