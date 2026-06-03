using ITM.Emprendimientos.Domain.Entities;

namespace ITM.Emprendimientos.Domain.States;

/// <summary>
/// Estado: Eliminado — estado terminal. No hay transición posible desde aquí.
/// Implementa soft delete: el registro persiste en la BD para auditoría.
/// </summary>
public class EliminadoState : IProductoEstado
{
    public void Activar(Producto producto)
        => throw new InvalidOperationException(
               "Un producto eliminado no puede reactivarse.");

    public void Ocultar(Producto producto)
        => throw new InvalidOperationException(
               "Un producto eliminado no puede ocultarse.");

    public void Eliminar(Producto producto)
        => throw new InvalidOperationException(
               "El producto ya está eliminado.");

    public string ObtenerNombre() => "Eliminado";
}