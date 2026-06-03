using ITM.Emprendimientos.DataAccess.Context;
using ITM.Emprendimientos.Domain.Entities;
using ITM.Emprendimientos.Domain.Enums;
using ITM.Emprendimientos.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ITM.Emprendimientos.DataAccess.Repositories;

public class ProductoRepository : GenericRepository<Producto>, IProductoRepository
{
    public ProductoRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Producto>> ObtenerDisponiblesAsync(string? busqueda, Guid? categoriaId)
    {
        var query = _context.Productos
            .Include(p => p.Categoria)
            .Include(p => p.Emprendedor)
            .Where(p => p.Estado == EstadoProducto.Activo && !p.AdminDisabled)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(busqueda))
            query = query.Where(p => p.Nombre.ToLower().Contains(busqueda.ToLower()));

        if (categoriaId.HasValue)
            query = query.Where(p => p.CategoriaId == categoriaId.Value);

        return await query.OrderBy(p => p.Nombre).ToListAsync();
    }

    public async Task<IEnumerable<Producto>> ObtenerTodosParaAdminAsync(string? busqueda, Guid? categoriaId)
    {
        var query = _context.Productos
            .Include(p => p.Categoria)
            .Include(p => p.Emprendedor)
            .Where(p => p.Estado != EstadoProducto.Eliminado)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(busqueda))
            query = query.Where(p => p.Nombre.ToLower().Contains(busqueda.ToLower()));

        if (categoriaId.HasValue)
            query = query.Where(p => p.CategoriaId == categoriaId.Value);

        return await query.OrderByDescending(p => p.CreadoEn).ToListAsync();
    }

    public async Task<IEnumerable<Producto>> ObtenerPorEmprendedorAsync(Guid emprendedorId)
        => await _context.Productos
                         .Include(p => p.Categoria)
                         .Where(p => p.EmprendedorId == emprendedorId
                                  && p.Estado != EstadoProducto.Eliminado)
                         .OrderByDescending(p => p.CreadoEn)
                         .ToListAsync();

    public async Task<Producto?> ObtenerConDetalleAsync(Guid id)
        => await _context.Productos
                         .Include(p => p.Categoria)
                         .Include(p => p.Emprendedor)
                         .FirstOrDefaultAsync(p => p.Id == id);

    public async Task<(int Total, int Activos, int Inactivos)> ObtenerEstadisticasAsync()
    {
        var total = await _context.Productos.CountAsync(p => p.Estado != EstadoProducto.Eliminado);
        var activos = await _context.Productos.CountAsync(p => p.Estado == EstadoProducto.Activo);
        var inactivos = await _context.Productos.CountAsync(p => p.Estado == EstadoProducto.Inactivo);
        return (total, activos, inactivos);
    }
    public async Task PropagarpPerfilAProductosAsync(
    Guid emprendedorId,
    string nuevoNombreEmprendimiento,
    string nuevaDescripcion,
    string? nuevaFotoUrl)
    {
        await _context.Productos
            .Where(p => p.EmprendedorId == emprendedorId
                     && p.Estado != EstadoProducto.Eliminado)
            .ExecuteUpdateAsync(s => s
                .SetProperty(p => p.ActualizadoEn, DateTime.UtcNow));


    }
}