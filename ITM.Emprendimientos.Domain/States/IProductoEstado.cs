namespace ITM.Emprendimientos.Domain.States;

/// <summary>
/// Patrón: State
/// Define el contrato de comportamiento para cada estado del producto.
/// Cada método representa una transición posible. Si la transición
/// no está permitida desde el estado actual, lanza InvalidOperationException.
/// </summary>
public interface IProductoEstado
{
    /// <summary>Activa el producto, haciéndolo visible en el catálogo.</summary>
    void Activar(Entities.Producto producto);

    /// <summary>Oculta el producto del catálogo sin eliminarlo.</summary>
    void Ocultar(Entities.Producto producto);

    /// <summary>Marca el producto como eliminado (soft delete).</summary>
    void Eliminar(Entities.Producto producto);

    /// <summary>Nombre legible del estado actual (para respuestas y auditoría).</summary>
    string ObtenerNombre();
}