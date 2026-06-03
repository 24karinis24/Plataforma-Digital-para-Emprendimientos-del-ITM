using ITM.Emprendimientos.Domain.Events;
using Microsoft.Extensions.Logging;

namespace ITM.Emprendimientos.Domain.Observers;

/// <summary>
/// Observador: registra el cambio de estado del producto y marca
/// el catálogo como necesitando refresco en la siguiente consulta.
/// En el MVP, el refresco es automático porque el comprador llama
/// GET /api/Productos en cada carga del catálogo.
/// En versiones futuras, este observer puede invalidar un caché Redis.
/// </summary>
public class CatalogoObserver : IObservadorProducto
{
    private readonly ILogger<CatalogoObserver> _logger;

    public CatalogoObserver(ILogger<CatalogoObserver> logger)
    {
        _logger = logger;
    }

    public Task OnProductoCambiadoAsync(ProductoEstadoCambiadoEvent evento)
    {
        _logger.LogInformation(
            "[CATÁLOGO] Producto '{Nombre}' ({Id}) cambió de '{Anterior}' a '{Nuevo}' — " +
            "el catálogo público se actualizará en la próxima consulta.",
            evento.NombreProducto,
            evento.ProductoId,
            evento.EstadoAnterior,
            evento.NuevoEstado);

        // Punto de extensión: aquí se puede agregar invalidación de caché
        // await _cacheService.InvalidarCatalogoAsync();

        return Task.CompletedTask;
    }
}