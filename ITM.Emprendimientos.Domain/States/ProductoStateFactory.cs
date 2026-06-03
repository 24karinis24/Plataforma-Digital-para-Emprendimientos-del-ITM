using ITM.Emprendimientos.Domain.Enums;

namespace ITM.Emprendimientos.Domain.States;

/// <summary>
/// Resuelve el objeto de estado correcto a partir del enum EstadoProducto.
/// Centraliza la creación de estados; el servicio nunca hace "new ActivoState()" directamente.
/// </summary>
public static class ProductoStateFactory
{
    public static IProductoEstado Resolver(EstadoProducto estado) => estado switch
    {
        EstadoProducto.Activo => new ActivoState(),
        EstadoProducto.Inactivo => new InactivoState(),
        EstadoProducto.Eliminado => new EliminadoState(),
        _ => throw new ArgumentException($"Estado de producto desconocido: {estado}")
    };
}