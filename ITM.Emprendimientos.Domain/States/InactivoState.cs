using ITM.Emprendimientos.Domain.Entities;
using ITM.Emprendimientos.Domain.Enums;

namespace ITM.Emprendimientos.Domain.States;

/// <summary>
/// Estado: Inactivo — el producto está oculto del catálogo.
/// Puede ser por decisión del emprendedor o por acción del administrador.
/// Transiciones permitidas: → Activo, → Eliminado.
/// </summary>
public class InactivoState : IProductoEstado
{
    public void Activar(Producto producto)
    {
        producto.Estado = EstadoProducto.Activo;
        producto.AdminDisabled = false;
        producto.ActualizadoEn = DateTime.UtcNow;
    }

    public void Ocultar(Producto producto)
        => throw new InvalidOperationException(
               "El producto ya está inactivo. No se puede ocultar nuevamente.");

    public void Eliminar(Producto producto)
    {
        producto.Estado = EstadoProducto.Eliminado;
        producto.ActualizadoEn = DateTime.UtcNow;
    }

    public string ObtenerNombre() => "Inactivo";
}