namespace ITM.Emprendimientos.Domain.Entities;

/// <summary>
/// Bitácora de cambios de estado de productos.
/// Creada por AuditoriaObserver; nunca modificada después de su inserción.
/// </summary>
public class AuditoriaProducto : AuditBase
{
    public Guid ProductoId { get; set; }
    public string NombreProducto { get; set; } = string.Empty;
    public string EstadoAnterior { get; set; } = string.Empty;
    public string NuevoEstado { get; set; } = string.Empty;
    public string ResponsableEmail { get; set; } = string.Empty;
    public string? Motivo { get; set; }
    public DateTime OcurridoEn { get; set; }
}