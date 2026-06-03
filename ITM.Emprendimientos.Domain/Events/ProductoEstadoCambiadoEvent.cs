namespace ITM.Emprendimientos.Domain.Events;

/// <summary>
/// Evento inmutable emitido cuando un producto cambia de estado.
/// Transporta toda la información necesaria para los observadores
/// sin acoplarlos a la entidad Producto.
/// </summary>
public record ProductoEstadoCambiadoEvent(
    Guid ProductoId,
    string NombreProducto,
    string EstadoAnterior,
    string NuevoEstado,
    string ResponsableEmail,
    string? Motivo,
    DateTime OcurridoEn
);