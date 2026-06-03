using ITM.Emprendimientos.Domain.Events;

namespace ITM.Emprendimientos.Domain.Observers;

/// <summary>
/// Patrón: Observer
/// Contrato para todos los observadores del ciclo de vida del producto.
/// Usar el evento tipado garantiza ISP: cada observador recibe exactamente
/// la información que necesita sin parámetros genéricos.
/// </summary>
public interface IObservadorProducto
{
    Task OnProductoCambiadoAsync(ProductoEstadoCambiadoEvent evento);
}