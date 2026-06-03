using ITM.Emprendimientos.Domain.Entities;
using ITM.Emprendimientos.Domain.Enums;

namespace ITM.Emprendimientos.Domain.States;

/// <summary>
/// Estado: Activo — el producto está visible en el catálogo público.
/// Transiciones permitidas: → Inactivo, → Eliminado.
/// </summary>
public class ActivoState : IProductoEstado
{
    public void Activar(Producto producto)
        => throw new InvalidOperationException(
               "El producto ya está activo. No se puede activar nuevamente.");

    public void Ocultar(Producto producto)
    {
        producto.Estado = EstadoProducto.Inactivo;
        producto.ActualizadoEn = DateTime.UtcNow;
    }

    public void Eliminar(Producto producto)
    {
        producto.Estado = EstadoProducto.Eliminado;
        producto.ActualizadoEn = DateTime.UtcNow;
    }

    public string ObtenerNombre() => "Activo";
}