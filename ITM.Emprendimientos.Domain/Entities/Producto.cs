using ITM.Emprendimientos.Domain.Enums;
using ITM.Emprendimientos.Domain.States;
/// <summary>
/// Entidad central del marketplace. Su ciclo de vida está controlado
/// por el patrón State (Activo, Inactivo, Eliminado).
/// El patrón Observer notifica cambios de estado al catálogo y auditoría.
/// </summary>

namespace ITM.Emprendimientos.Domain.Entities;

public class Producto : AuditBase
{
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public string? ImagenUrl { get; set; }
    public EstadoProducto Estado { get; set; } = EstadoProducto.Activo;
    public bool AdminDisabled { get; set; } = false;

    // Foreign Keys
    public Guid CategoriaId { get; set; }
    public Guid EmprendedorId { get; set; }

    // Navigation Properties
    public Categoria Categoria { get; set; } = null!;
    public Emprendedor Emprendedor { get; set; } = null!;

    // ── Patrón State ─────────────────────────────────────────────────

    /// <summary>
    /// Aplica una transición de estado usando el patrón State.
    /// Delega al objeto de estado actual; si la transición no es válida
    /// el estado lanza InvalidOperationException.
    /// </summary>
    public void Activar() => ProductoStateFactory.Resolver(Estado).Activar(this);
    public void Ocultar() => ProductoStateFactory.Resolver(Estado).Ocultar(this);
    public void Eliminar() => ProductoStateFactory.Resolver(Estado).Eliminar(this);

    public string ObtenerNombreEstado()
        => ProductoStateFactory.Resolver(Estado).ObtenerNombre();
}